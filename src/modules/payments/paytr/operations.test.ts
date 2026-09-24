import { describe, expect, it } from "vitest";
import { parsePaytrStatusResult } from "./operations-parser";

describe("parsePaytrStatusResult", () => {
  it("maps a successful provider response without trusting it as an order state", () => {
    expect(parsePaytrStatusResult({ status: "success", payment_amount: "1199.00", payment_total: "1299.00", currency: "TL", test_mode: "1", returns: [] })).toMatchObject({
      paymentAmount: "1199.00",
      paymentTotal: "1299.00",
      currency: "TL",
      testMode: true,
    });
  });

  it("throws on a provider error", () => {
    expect(() => parsePaytrStatusResult({ status: "error", err_msg: "not found" })).toThrow("not found");
  });
});
