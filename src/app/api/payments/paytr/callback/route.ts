import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { inventoryMovements, orderItems, orders, paymentCallbacks, payments, productVariants } from "@/db/schema";
import { getPaytrCredentials } from "@/modules/payments/paytr/client";
import { parsePaytrCallback } from "@/modules/payments/paytr/callback";
import { verifyCallbackHash } from "@/modules/payments/paytr/signatures";

export const runtime = "nodejs";

const ok = () => new Response("OK", { status: 200, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
const bad = () => new Response("BAD", { status: 400, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const raw = Object.fromEntries([...form.entries()].map(([key, value]) => [key, typeof value === "string" ? value : ""]));
    const callback = parsePaytrCallback(raw);
    const credentials = getPaytrCredentials();
    if (!verifyCallbackHash({ ...credentials, merchantOid: callback.merchantOid, status: callback.status, totalAmount: String(callback.totalAmount), hash: callback.hash })) {
      return bad();
    }

    await db.transaction(async (tx) => {
      const now = new Date().toISOString();
      const inserted = await tx
        .insert(paymentCallbacks)
        .values({
          id: randomUUID(),
          provider: "paytr",
          providerOrderId: callback.merchantOid,
          callbackHash: callback.hash,
          status: callback.status,
          amount: callback.totalAmount,
          payloadJson: raw,
          createdAt: now,
        })
        .onConflictDoNothing()
        .returning({ id: paymentCallbacks.id });
      if (!inserted[0]) return;

      const rows = await tx
        .select({
          paymentId: payments.id,
          paymentStatus: payments.status,
          orderId: orders.id,
          requestedAmount: payments.requestedAmount,
          orderStatus: orders.orderStatus,
        })
        .from(payments)
        .innerJoin(orders, eq(orders.id, payments.orderId))
        .where(and(eq(payments.provider, "paytr"), eq(payments.providerOrderId, callback.merchantOid)))
        .limit(1);
      const payment = rows[0];
      if (!payment) return;

      await tx.update(paymentCallbacks).set({ paymentId: payment.paymentId, processedAt: now }).where(eq(paymentCallbacks.id, inserted[0].id));
      if (payment.paymentStatus !== "pending") return;

      if (callback.status === "success") {
        await tx.update(payments).set({
          status: "paid",
          capturedAmount: callback.totalAmount,
          paymentType: callback.paymentType || null,
          testMode: callback.testMode,
          paidAt: now,
          failureCode: null,
          failureMessage: null,
          updatedAt: now,
        }).where(eq(payments.id, payment.paymentId));
        await tx.update(orders).set({ paymentStatus: "paid", orderStatus: "paid", paidAt: now, updatedAt: now }).where(eq(orders.id, payment.orderId));
        const items = await tx.select({ productId: orderItems.productId, variantId: orderItems.variantId, quantity: orderItems.quantity }).from(orderItems).where(eq(orderItems.orderId, payment.orderId));
        if (items.length) {
          await tx.insert(inventoryMovements).values(items.filter((item): item is typeof item & { productId: string } => Boolean(item.productId)).map((item) => ({
            id: randomUUID(), productId: item.productId, variantId: item.variantId, type: "sale" as const, quantityDelta: 0, referenceType: "order", referenceId: payment.orderId, note: "PAYTR ödemesi doğrulandı", createdAt: now,
          })));
        }
        return;
      }

      await tx.update(payments).set({
        status: "failed",
        failureCode: callback.failedReasonCode || null,
        failureMessage: callback.failedReasonMessage || "PAYTR ödemeyi onaylamadı.",
        paymentType: callback.paymentType || null,
        testMode: callback.testMode,
        updatedAt: now,
      }).where(eq(payments.id, payment.paymentId));
      await tx.update(orders).set({ paymentStatus: "failed", orderStatus: "cancelled", cancelledAt: now, updatedAt: now }).where(eq(orders.id, payment.orderId));
      const items = await tx.select({ productId: orderItems.productId, variantId: orderItems.variantId, quantity: orderItems.quantity }).from(orderItems).where(eq(orderItems.orderId, payment.orderId));
      for (const item of items) {
        if (!item.productId || !item.variantId) continue;
        await tx.update(productVariants).set({ stockQuantity: sql`${productVariants.stockQuantity} + ${item.quantity}`, updatedAt: now }).where(eq(productVariants.id, item.variantId));
        await tx.insert(inventoryMovements).values({
          id: randomUUID(), productId: item.productId, variantId: item.variantId, type: "release", quantityDelta: item.quantity, referenceType: "order", referenceId: payment.orderId, note: "PAYTR ödeme başarısız", createdAt: now,
        });
      }
    });
    return ok();
  } catch {
    return bad();
  }
}
