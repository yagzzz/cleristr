import { describe, expect, it } from "vitest";
import { parseCatalogAdminInput, parseVariantAdminInput } from "./catalog-input";

describe("parseCatalogAdminInput", () => {
  it("converts a Turkish storefront price to kuruş", () => {
    expect(parseCatalogAdminInput({ name: "Baggy Eşofman Altı", priceAmount: "1.199,00", stockQuantity: "12", status: "published", trackInventory: "on", allowPreorder: "" })).toEqual({
      name: "Baggy Eşofman Altı",
      priceAmount: 119900,
      stockQuantity: 12,
      status: "published",
      trackInventory: true,
      allowPreorder: false,
    });
  });

  it("rejects an invalid financial value", () => {
    expect(() => parseCatalogAdminInput({ name: "Ürün", priceAmount: "-1", stockQuantity: "0", status: "published" })).toThrow();
  });

  it("permits a variant to inherit the product price while tracking a real stock value", () => {
    expect(parseVariantAdminInput({ priceAmount: "", stockQuantity: "8", status: "active" })).toEqual({
      priceAmount: null,
      stockQuantity: 8,
      status: "active",
    });
  });
});
