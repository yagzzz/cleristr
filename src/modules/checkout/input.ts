import { z } from "zod";

const addressSchema = z.object({
  line1: z.string().trim().min(5, "Adres en az 5 karakter olmalı.").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  district: z.string().trim().min(2, "İlçe gerekli.").max(80),
  city: z.string().trim().min(2, "İl gerekli.").max(80),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  countryCode: z.string().trim().toUpperCase().length(2).default("TR"),
});

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-zA-Z0-9_-]{3,80}$/, "Ürün kimliği geçersiz."),
        variantId: z.string().regex(/^[a-zA-Z0-9_-]{3,80}$/, "Varyasyon kimliği geçersiz."),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Sepet boş."),
  customer: z.object({
    email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin.").max(100),
    firstName: z.string().trim().min(2, "Ad gerekli.").max(60),
    lastName: z.string().trim().min(2, "Soyad gerekli.").max(60),
    phone: z.string().trim().min(7, "Telefon gerekli.").max(20),
  }),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  shippingMethodId: z.string().regex(/^[a-zA-Z0-9_-]{3,80}$/, "Kargo yöntemi geçersiz."),
  checkoutKey: z.string().regex(/^[a-zA-Z0-9_-]{16,128}$/, "Checkout anahtarı geçersiz."),
  couponCode: z.string().trim().toUpperCase().max(50).optional(),
  customerNote: z.string().trim().max(1000).optional(),
  termsAccepted: z.literal(true, { error: "Koşulları kabul etmelisiniz." }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export function parseCheckoutInput(input: unknown): CheckoutInput {
  const parsed = checkoutSchema.parse(input);
  const ids = new Set<string>();
  for (const item of parsed.items) {
    if (ids.has(item.variantId)) throw new Error("Sepette aynı ürün varyasyonu birden fazla kez bulunamaz.");
    ids.add(item.variantId);
  }
  return parsed;
}
