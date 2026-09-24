"use server";

import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { adminAuditLogs, announcements, inventoryMovements, products, productVariants, shippingMethods } from "@/db/schema";
import { requirePermission } from "@/modules/auth/session";
import { parseAnnouncementInput } from "@/modules/admin/announcement-input";
import { parseCatalogAdminInput, parseTurkishPrice, parseVariantAdminInput } from "@/modules/admin/catalog-input";

const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{3,80}$/);
const shippingSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{2,50}$/),
  description: z.string().trim().max(300).optional(),
  basePriceAmount: z.string().transform(parseTurkishPrice),
  freeThresholdAmount: z.string().transform((value) => value.trim() ? parseTurkishPrice(value) : null),
  estimatedMinDays: z.string().trim().regex(/^\d+$/).transform(Number),
  estimatedMaxDays: z.string().trim().regex(/^\d+$/).transform(Number),
});

async function audit(actorUserId: string, action: string, entityType: string, entityId: string, summary: string, beforeJson: Record<string, unknown> | null, afterJson: Record<string, unknown> | null) {
  await db.insert(adminAuditLogs).values({ id: randomUUID(), actorUserId, action, entityType, entityId, summary, beforeJson, afterJson, createdAt: new Date().toISOString() });
}

export async function updateProductAction(formData: FormData) {
  const actor = await requirePermission("products.update");
  const productId = idSchema.parse(formData.get("productId"));
  const input = parseCatalogAdminInput({
    name: formData.get("name"), priceAmount: formData.get("priceAmount"), stockQuantity: formData.get("stockQuantity"), status: formData.get("status"), trackInventory: formData.get("trackInventory") || undefined, allowPreorder: formData.get("allowPreorder") || undefined,
  });
  const current = (await db.select().from(products).where(eq(products.id, productId)).limit(1))[0];
  if (!current) throw new Error("Ürün bulunamadı.");
  const now = new Date().toISOString();
  await db.update(products).set({ name: input.name, priceAmount: input.priceAmount, stockQuantity: input.stockQuantity, status: input.status, trackInventory: input.trackInventory, allowPreorder: input.allowPreorder, updatedAt: now }).where(eq(products.id, productId));
  await audit(actor.id, "product.update", "product", productId, `${input.name} güncellendi`, { name: current.name, priceAmount: current.priceAmount, stockQuantity: current.stockQuantity, status: current.status }, { name: input.name, priceAmount: input.priceAmount, stockQuantity: input.stockQuantity, status: input.status });
  revalidatePath("/"); revalidatePath("/magaza"); revalidatePath("/admin"); revalidatePath(`/urun/${current.slug}`);
}

export async function updateVariantAction(formData: FormData) {
  const actor = await requirePermission("products.update");
  const variantId = idSchema.parse(formData.get("variantId"));
  const input = parseVariantAdminInput({ priceAmount: formData.get("priceAmount"), stockQuantity: formData.get("stockQuantity"), status: formData.get("status") });
  const current = (await db.select().from(productVariants).where(eq(productVariants.id, variantId)).limit(1))[0];
  if (!current) throw new Error("Varyasyon bulunamadı.");
  const now = new Date().toISOString();
  const delta = input.stockQuantity - current.stockQuantity;
  await db.transaction(async (tx) => {
    await tx.update(productVariants).set({ priceAmount: input.priceAmount, stockQuantity: input.stockQuantity, status: input.status, updatedAt: now }).where(eq(productVariants.id, variantId));
    const aggregate = await tx.select({ count: sql<number>`coalesce(sum(${productVariants.stockQuantity}), 0)` }).from(productVariants).where(eq(productVariants.productId, current.productId));
    await tx.update(products).set({ stockQuantity: Number(aggregate[0]?.count || 0), updatedAt: now }).where(eq(products.id, current.productId));
    if (delta) await tx.insert(inventoryMovements).values({ id: randomUUID(), productId: current.productId, variantId, type: "adjustment", quantityDelta: delta, referenceType: "admin", referenceId: actor.id, note: "Admin panelinden stok güncellemesi", actorUserId: actor.id, createdAt: now });
  });
  await audit(actor.id, "variant.update", "variant", variantId, `${current.sku} varyasyonu güncellendi`, { priceAmount: current.priceAmount, stockQuantity: current.stockQuantity, status: current.status }, input);
  revalidatePath("/"); revalidatePath("/magaza"); revalidatePath("/admin");
}

export async function createShippingMethodAction(formData: FormData) {
  const actor = await requirePermission("shipping.update");
  const input = shippingSchema.parse({ name: formData.get("name"), code: formData.get("code"), description: formData.get("description") || undefined, basePriceAmount: formData.get("basePriceAmount"), freeThresholdAmount: formData.get("freeThresholdAmount"), estimatedMinDays: formData.get("estimatedMinDays"), estimatedMaxDays: formData.get("estimatedMaxDays") });
  if (input.estimatedMaxDays < input.estimatedMinDays) throw new Error("Teslimat aralığı geçersiz.");
  const now = new Date().toISOString();
  const id = randomUUID();
  await db.insert(shippingMethods).values({ id, ...input, description: input.description || null, isActive: true, sortOrder: 0, createdAt: now, updatedAt: now });
  await audit(actor.id, "shipping.create", "shipping_method", id, `${input.name} kargo yöntemi oluşturuldu`, null, input);
  revalidatePath("/checkout"); revalidatePath("/admin");
}

export async function saveTopAnnouncementAction(formData: FormData) {
  const actor = await requirePermission("content.update");
  const id = String(formData.get("announcementId") || "");
  const input = parseAnnouncementInput({ message: formData.get("message"), href: formData.get("href"), dismissible: formData.get("dismissible") || undefined, isActive: formData.get("isActive") || undefined });
  const now = new Date().toISOString();
  const current = id ? (await db.select().from(announcements).where(eq(announcements.id, id)).limit(1))[0] : null;
  const announcementId = current?.id || randomUUID();
  if (current) {
    await db.update(announcements).set({ ...input, updatedAt: now }).where(eq(announcements.id, announcementId));
  } else {
    await db.insert(announcements).values({ id: announcementId, type: "top_bar", audience: "all", ...input, createdAt: now, updatedAt: now });
  }
  await audit(actor.id, "announcement.save", "announcement", announcementId, "Üst duyuru güncellendi", current ? { message: current.message, href: current.href, isActive: current.isActive } : null, input);
  revalidatePath("/"); revalidatePath("/admin");
}
