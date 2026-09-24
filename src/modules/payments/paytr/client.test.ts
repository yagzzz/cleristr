import { describe, expect, it } from "vitest";
import { parsePaytrCredentials } from "./client";

describe("parsePaytrCredentials", () => {
  it("accepts a complete server-side credential set", () => {
    expect(parsePaytrCredentials({ PAYTR_MERCHANT_ID: "123456", PAYTR_MERCHANT_KEY: "key", PAYTR_MERCHANT_SALT: "salt" })).toEqual({
      merchantId: "123456",
      merchantKey: "key",
      merchantSalt: "salt",
    });
  });

  it("does not allow a partial payment configuration", () => {
    expect(() => parsePaytrCredentials({ PAYTR_MERCHANT_ID: "123456" })).toThrow("PAYTR yapılandırması eksik");
  });
});
