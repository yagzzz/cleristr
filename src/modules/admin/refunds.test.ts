import { describe, expect, it } from "vitest";
import { getRefundableAmount } from "./refunds";

describe("getRefundableAmount", () => {
  it("subtracts completed refunds from the captured amount", () => {
    expect(getRefundableAmount(119900, [20000, 30000])).toBe(69900);
  });

  it("rejects malformed payment values", () => {
    expect(() => getRefundableAmount(-1, [])).toThrow();
  });
});
