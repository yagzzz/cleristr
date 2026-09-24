import { describe, expect, it } from "vitest";
import { parseCheckoutInput } from "./input";

const valid = {
  items: [{ productId: "00000000-0000-0000-0000-000000000001", variantId: "00000000-0000-0000-0000-000000000002", quantity: 1 }],
  customer: { email: " BUYER@EXAMPLE.COM ", firstName: "Ada", lastName: "Yılmaz", phone: "+90 555 111 22 33" },
  shippingAddress: { line1: "Moda Caddesi 10", district: "Kadıköy", city: "İstanbul", postalCode: "34710" },
  billingAddress: { line1: "Moda Caddesi 10", district: "Kadıköy", city: "İstanbul", postalCode: "34710" },
  shippingMethodId: "shipping_standard",
  checkoutKey: "checkout_20260920_9f72a1",
  termsAccepted: true,
};

describe("parseCheckoutInput", () => {
  it("normalizes a valid checkout payload", () => {
    expect(parseCheckoutInput(valid)).toMatchObject({
      customer: { email: "buyer@example.com", firstName: "Ada" },
      shippingAddress: { countryCode: "TR", line1: "Moda Caddesi 10" },
      shippingMethodId: "shipping_standard",
      checkoutKey: "checkout_20260920_9f72a1",
      termsAccepted: true,
    });
  });

  it("rejects a checkout without explicit legal acceptance", () => {
    expect(() => parseCheckoutInput({ ...valid, termsAccepted: false })).toThrow("Koşulları kabul etmelisiniz");
  });

  it("rejects duplicate variations before order creation", () => {
    expect(() => parseCheckoutInput({ ...valid, items: [...valid.items, valid.items[0]] })).toThrow("aynı ürün varyasyonu");
  });
});
