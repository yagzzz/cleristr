import { describe, expect, it } from "vitest";
import { can } from "./permissions";

describe("admin permissions", () => {
  it("gives the owner every declared permission", () => {
    expect(can("owner", "payments.refund")).toBe(true);
    expect(can("owner", "settings.update")).toBe(true);
  });

  it("keeps operational roles within their boundaries", () => {
    expect(can("order_manager", "orders.update")).toBe(true);
    expect(can("order_manager", "payments.refund")).toBe(false);
    expect(can("content_manager", "content.update")).toBe(true);
    expect(can("content_manager", "orders.update")).toBe(false);
    expect(can("marketing", "marketing.update")).toBe(true);
    expect(can("marketing", "customers.export")).toBe(false);
  });

  it("never grants admin permissions to customers", () => {
    expect(can("customer", "admin.access")).toBe(false);
  });
});
