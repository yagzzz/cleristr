import { describe, expect, it } from "vitest";
import { createShopHref } from "./shop-discovery-bar";

describe("createShopHref", () => {
  it("preserves only supported, shareable filters", () => {
    expect(createShopHref({ search: "baggy", category: "alt-giyim", availability: "in_stock", priced: true })).toBe("/magaza?q=baggy&category=alt-giyim&availability=in_stock&priced=1");
  });

  it("omits empty filter values", () => {
    expect(createShopHref({ search: "", category: "all", availability: "all", priced: false })).toBe("/magaza");
  });
});
