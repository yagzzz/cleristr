import { z } from "zod";

export function parseTurkishPrice(raw: string) {
  const value = raw.trim();
  if (!value) throw new Error("Tutar gerekli.");
  let normalized: string;
  if (value.includes(",")) {
    if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(value) && !/^\d+(,\d{1,2})?$/.test(value)) throw new Error("Tutar geçersiz.");
    normalized = value.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(value)) {
    normalized = value.replace(/\./g, "");
  } else if (/^\d+(\.\d{1,2})?$/.test(value)) {
    normalized = value;
  } else {
    throw new Error("Tutar geçersiz.");
  }
  const [whole, fraction = ""] = normalized.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("Tutar geçersiz.");
  return amount;
}

const money = z.string().transform(parseTurkishPrice);
const quantity = z.string().trim().regex(/^\d+$/, "Stok tam sayı olmalı.").transform(Number).refine(Number.isSafeInteger, "Stok geçersiz.");

const catalogAdminSchema = z.object({
  name: z.string().trim().min(2).max(160),
  priceAmount: money,
  stockQuantity: quantity,
  status: z.enum(["draft", "published", "archived"]),
  trackInventory: z.string().optional(),
  allowPreorder: z.string().optional(),
});

export function parseCatalogAdminInput(input: unknown) {
  const value = catalogAdminSchema.parse(input);
  return { ...value, trackInventory: value.trackInventory === "on", allowPreorder: value.allowPreorder === "on" };
}

const variantAdminSchema = z.object({
  priceAmount: z.string().transform((value) => value.trim() ? parseTurkishPrice(value) : null),
  stockQuantity: quantity,
  status: z.enum(["active", "disabled", "out_of_stock"]),
});

export function parseVariantAdminInput(input: unknown) {
  return variantAdminSchema.parse(input);
}
