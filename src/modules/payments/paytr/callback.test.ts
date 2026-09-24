import { describe, expect, it } from "vitest";
import { parsePaytrCallback } from "./callback";

describe("parsePaytrCallback", () => {
  it("accepts a complete successful callback", () => {
    expect(parsePaytrCallback({ merchant_oid: "CL20260920ABC123", status: "success", total_amount: "119900", hash: "dGVzdC1wYXl0ci1oYXNoLXZhbHVlLTAx", payment_type: "card", currency: "TL", payment_amount: "119900" })).toMatchObject({
      merchantOid: "CL20260920ABC123",
      status: "success",
      totalAmount: 119900,
    });
  });

  it("rejects unsafe provider identifiers and invalid money", () => {
    expect(() => parsePaytrCallback({ merchant_oid: "../bad", status: "success", total_amount: "x", hash: "hash" })).toThrow();
  });
});
