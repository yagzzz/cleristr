import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { and, eq, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  coupons,
  inventoryMovements,
  mediaAssets,
  orderItems,
  orders,
  payments,
  productVariants,
  products,
  shippingMethods,
} from "@/db/schema";
import { buildQuote, type CouponForQuote } from "@/modules/pricing/quote";
import { getPaytrCredentials, requestPaytrIframeToken } from "@/modules/payments/paytr/client";
import { encodeBasket } from "@/modules/payments/paytr/signatures";
import { parseCheckoutInput, type CheckoutInput } from "./input";

type CheckoutActor = { userId?: string; userIp: string };
type AddressSnapshot = CheckoutInput["shippingAddress"] & { firstName: string; lastName: string; phone: string };

type PaymentRequest = {
  orderNumber: string;
  paymentId: string;
  amount: number;
  email: string;
  customerName: string;
  phone: string;
  address: string;
  basket: string;
};

function createOrderNumber() {
  const stamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  return `CL${stamp}${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

function formatAddress(address: AddressSnapshot) {
  return [address.line1, address.line2, address.district, address.city, address.postalCode, address.countryCode]
    .filter(Boolean)
    .join(", ");
}

function quoteDigest(quote: unknown) {
  return createHash("sha256").update(JSON.stringify(quote)).digest("hex");
}

export async function executeCheckout(rawInput: unknown, actor: CheckoutActor) {
  const input = parseCheckoutInput(rawInput);
  const credentials = getPaytrCredentials();
  const paymentRequest = await db.transaction(async (tx): Promise<PaymentRequest> => {
    const existing = await tx
      .select({
        orderNumber: orders.orderNumber,
        paymentId: payments.id,
        amount: payments.requestedAmount,
        email: orders.email,
        phone: orders.phone,
        shippingAddress: orders.shippingAddressJson,
      })
      .from(orders)
      .innerJoin(payments, eq(payments.orderId, orders.id))
      .where(and(eq(orders.checkoutKey, input.checkoutKey), eq(payments.provider, "paytr")))
      .limit(1);

    if (existing[0]) {
      const storedItems = await tx
        .select({ productName: orderItems.productName, unitPriceAmount: orderItems.unitPriceAmount, quantity: orderItems.quantity })
        .from(orderItems)
        .where(eq(orderItems.orderId, (await tx.select({ id: orders.id }).from(orders).where(eq(orders.checkoutKey, input.checkoutKey)).limit(1))[0].id));
      const address = existing[0].shippingAddress as AddressSnapshot;
      return {
        orderNumber: existing[0].orderNumber,
        paymentId: existing[0].paymentId,
        amount: existing[0].amount,
        email: existing[0].email,
        customerName: `${address.firstName} ${address.lastName}`,
        phone: existing[0].phone,
        address: formatAddress(address),
        basket: encodeBasket(storedItems.map((item) => ({ name: item.productName, unitPriceAmount: item.unitPriceAmount, quantity: item.quantity }))),
      };
    }

    const variantIds = input.items.map((item) => item.variantId);
    const catalogRows = await tx
      .select({
        variantId: productVariants.id,
        productId: products.id,
        variantName: productVariants.name,
        variantSku: productVariants.sku,
        variantPriceAmount: productVariants.priceAmount,
        variantStockQuantity: productVariants.stockQuantity,
        variantStatus: productVariants.status,
        productName: products.name,
        productPriceAmount: products.priceAmount,
        productStatus: products.status,
        productTrackInventory: products.trackInventory,
        productAllowPreorder: products.allowPreorder,
        taxRateBps: products.taxRateBps,
        taxIncluded: products.taxIncluded,
        imageUrl: mediaAssets.url,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .leftJoin(mediaAssets, eq(mediaAssets.id, products.mainMediaId))
      .where(inArray(productVariants.id, variantIds));

    if (catalogRows.length !== input.items.length) throw new Error("Sepetteki ürünlerden biri artık satışta değil.");
    const catalogByVariant = new Map(catalogRows.map((row) => [row.variantId, row]));
    for (const item of input.items) {
      const row = catalogByVariant.get(item.variantId);
      if (!row || row.productId !== item.productId || row.productStatus !== "published" || row.variantStatus !== "active") {
        throw new Error("Sepetteki ürünlerden biri artık satın alınamaz.");
      }
    }

    const shipping = await tx
      .select()
      .from(shippingMethods)
      .where(and(eq(shippingMethods.id, input.shippingMethodId), eq(shippingMethods.isActive, true)))
      .limit(1);
    if (!shipping[0]) throw new Error("Seçilen kargo yöntemi kullanılamıyor.");

    let coupon: (CouponForQuote & { id: string; code: string }) | undefined;
    if (input.couponCode) {
      const matched = await tx
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.code, input.couponCode),
            eq(coupons.isActive, true),
            or(isNull(coupons.startsAt), lte(coupons.startsAt, new Date().toISOString())),
            or(isNull(coupons.endsAt), gte(coupons.endsAt, new Date().toISOString())),
          ),
        )
        .limit(1);
      if (!matched[0] || matched[0].scope !== "cart" || matched[0].firstOrderOnly) {
        throw new Error("Bu kupon şu anda kullanılamıyor.");
      }
      coupon = { ...matched[0], kind: matched[0].kind, value: matched[0].value };
    }

    const quote = buildQuote({
      requestedLines: input.items.map(({ variantId, quantity }) => ({ variantId, quantity })),
      catalog: catalogRows.map((row) => ({
        variantId: row.variantId,
        productId: row.productId,
        name: `${row.productName} / ${row.variantName}`,
        unitPriceAmount: row.variantPriceAmount ?? row.productPriceAmount,
        stockQuantity: row.variantStockQuantity,
        trackInventory: row.productTrackInventory,
        allowPreorder: row.productAllowPreorder,
        taxRateBps: row.taxRateBps,
        taxIncluded: row.taxIncluded,
      })),
      shipping: { baseAmount: shipping[0].basePriceAmount, freeThresholdAmount: shipping[0].freeThresholdAmount },
      coupon,
    });

    const now = new Date();
    const nowIso = now.toISOString();
    const orderId = randomUUID();
    const orderNumber = createOrderNumber();
    const paymentId = randomUUID();
    const reservationUntil = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    const shippingAddress: AddressSnapshot = { ...input.shippingAddress, firstName: input.customer.firstName, lastName: input.customer.lastName, phone: input.customer.phone };
    const billingAddress: AddressSnapshot = { ...input.billingAddress, firstName: input.customer.firstName, lastName: input.customer.lastName, phone: input.customer.phone };

    for (const line of quote.lines) {
      const row = catalogByVariant.get(line.variantId)!;
      if (row.productTrackInventory && !row.productAllowPreorder) {
        const reserved = await tx
          .update(productVariants)
          .set({ stockQuantity: sql`${productVariants.stockQuantity} - ${line.quantity}`, updatedAt: nowIso })
          .where(and(eq(productVariants.id, line.variantId), gte(productVariants.stockQuantity, line.quantity)))
          .returning({ id: productVariants.id });
        if (!reserved[0]) throw new Error("Ürün stoğu ödeme sırasında tükendi.");
        await tx.insert(inventoryMovements).values({
          id: randomUUID(),
          productId: line.productId,
          variantId: line.variantId,
          type: "reserve",
          quantityDelta: -line.quantity,
          referenceType: "order",
          referenceId: orderId,
          note: "PAYTR ödeme rezervasyonu",
          createdAt: nowIso,
        });
      }
    }

    await tx.insert(orders).values({
      id: orderId,
      orderNumber,
      userId: actor.userId,
      email: input.customer.email,
      phone: input.customer.phone,
      currency: "TRY",
      subtotalAmount: quote.subtotalAmount,
      discountAmount: quote.discountAmount,
      shippingAmount: quote.shippingAmount,
      taxAmount: quote.taxAmount,
      totalAmount: quote.totalAmount,
      couponCode: coupon?.code,
      couponId: coupon?.id,
      shippingMethodId: shipping[0].id,
      paymentStatus: "pending",
      orderStatus: "payment_pending",
      shippingStatus: "not_ready",
      shippingAddressJson: shippingAddress,
      billingAddressJson: billingAddress,
      customerNote: input.customerNote || null,
      checkoutKey: input.checkoutKey,
      quoteHash: quoteDigest(quote),
      quoteExpiresAt: reservationUntil,
      inventoryReservedUntil: reservationUntil,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    await tx.insert(orderItems).values(
      quote.lines.map((line) => {
        const row = catalogByVariant.get(line.variantId)!;
        return {
          id: randomUUID(),
          orderId,
          productId: line.productId,
          variantId: line.variantId,
          productName: row.productName,
          variantName: row.variantName,
          sku: row.variantSku,
          imageUrl: row.imageUrl,
          quantity: line.quantity,
          unitPriceAmount: line.unitPriceAmount,
          discountAmount: 0,
          taxAmount: line.taxAmount,
          lineTotalAmount: line.lineTotalAmount,
          createdAt: nowIso,
        };
      }),
    );
    await tx.insert(payments).values({
      id: paymentId,
      orderId,
      provider: "paytr",
      providerOrderId: orderNumber,
      status: "pending",
      requestedAmount: quote.totalAmount,
      currency: "TRY",
      testMode: process.env.PAYTR_TEST_MODE === "1",
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    return {
      orderNumber,
      paymentId,
      amount: quote.totalAmount,
      email: input.customer.email,
      customerName: `${input.customer.firstName} ${input.customer.lastName}`,
      phone: input.customer.phone,
      address: formatAddress(shippingAddress),
      basket: encodeBasket(quote.lines),
    };
  });

  try {
    const iframe = await requestPaytrIframeToken({
      credentials,
      userIp: actor.userIp,
      merchantOid: paymentRequest.orderNumber,
      email: paymentRequest.email,
      paymentAmount: paymentRequest.amount,
      userBasket: paymentRequest.basket,
      userName: paymentRequest.customerName,
      userAddress: paymentRequest.address,
      userPhone: paymentRequest.phone,
      okUrl: `${process.env.APP_URL}/odeme/basarili`,
      failUrl: `${process.env.APP_URL}/odeme/basarisiz`,
    });
    return { orderNumber: paymentRequest.orderNumber, iframeToken: iframe.token, testMode: iframe.testMode };
  } catch (error) {
    await db
      .update(payments)
      .set({ failureMessage: error instanceof Error ? error.message : "PAYTR token oluşturulamadı.", updatedAt: new Date().toISOString() })
      .where(eq(payments.id, paymentRequest.paymentId));
    throw error;
  }
}
