import { describe, expect, it } from "vitest";
import { buildQuote } from "./quote";

const catalog = [
  {
    variantId: "variant-xs",
    productId: "product-baggy",
    name: "Baggy / XS",
    unitPriceAmount: 100_00,
    stockQuantity: 3,
    trackInventory: true,
    allowPreorder: false,
    taxRateBps: 2_000,
    taxIncluded: true,
  },
];

describe("buildQuote", () => {
  it("recalculates line and cart totals from trusted catalog values", () => {
    const quote = buildQuote({
      requestedLines: [{ variantId: "variant-xs", quantity: 2 }],
      catalog,
      shipping: { baseAmount: 49_90, freeThresholdAmount: 150_00 },
    });

    expect(quote.lines[0]).toMatchObject({
      variantId: "variant-xs",
      unitPriceAmount: 100_00,
      quantity: 2,
      lineTotalAmount: 200_00,
    });
    expect(quote.subtotalAmount).toBe(200_00);
    expect(quote.shippingAmount).toBe(0);
    expect(quote.totalAmount).toBe(200_00);
  });

  it("rejects quantities that exceed stock instead of silently changing the cart", () => {
    expect(() =>
      buildQuote({
        requestedLines: [{ variantId: "variant-xs", quantity: 4 }],
        catalog,
        shipping: { baseAmount: 49_90, freeThresholdAmount: null },
      }),
    ).toThrow("Yeterli stok yok");
  });

  it("applies a percentage coupon with a maximum discount", () => {
    const quote = buildQuote({
      requestedLines: [{ variantId: "variant-xs", quantity: 2 }],
      catalog,
      shipping: { baseAmount: 49_90, freeThresholdAmount: null },
      coupon: {
        kind: "percentage",
        value: 2_500,
        maximumDiscountAmount: 30_00,
        minimumCartAmount: 100_00,
      },
    });

    expect(quote.discountAmount).toBe(30_00);
    expect(quote.shippingAmount).toBe(49_90);
    expect(quote.totalAmount).toBe(219_90);
  });

  it("does not produce a purchasable quote for a variant without a real price", () => {
    expect(() =>
      buildQuote({
        requestedLines: [{ variantId: "variant-xs", quantity: 1 }],
        catalog: [{ ...catalog[0], unitPriceAmount: null }],
        shipping: { baseAmount: 0, freeThresholdAmount: null },
      }),
    ).toThrow("Satış fiyatı tanımlanmamış");
  });
});
