import { describe, expect, it } from "vitest";
import {
  createCallbackHash,
  createIframeToken,
  createRefundToken,
  createStatusToken,
  encodeBasket,
  formatKurusAsPaytrAmount,
  verifyCallbackHash,
} from "./signatures";

const credentials = {
  merchantId: "123456",
  merchantKey: "merchant-key",
  merchantSalt: "merchant-salt",
};

describe("PAYTR signatures", () => {
  it("creates the official iFrame token in the documented field order", () => {
    expect(
      createIframeToken({
        ...credentials,
        userIp: "203.0.113.10",
        merchantOid: "CL20260001",
        email: "buyer@example.com",
        paymentAmount: "119900",
        userBasket: "W1siQmFnZ3kiLCIxMTk5LjAwIiwxXV0=",
        noInstallment: "0",
        maxInstallment: "0",
        currency: "TL",
        testMode: "1",
      }),
    ).toBe("R9cLWBezxk8qfb4F9lBfckSLPGTWbZnHoeKeLBEPiws=");
  });

  it("verifies callback hashes with a timing-safe comparison and rejects tampering", () => {
    const payload = { merchantOid: "CL20260001", status: "success", totalAmount: "119900" };
    const hash = createCallbackHash({ ...credentials, ...payload });

    expect(hash).toBe("9T7ODMOkh1mZUypji84+4xAVhuo57W3qgS4yR18qzdw=");
    expect(verifyCallbackHash({ ...credentials, ...payload, hash })).toBe(true);
    expect(verifyCallbackHash({ ...credentials, ...payload, totalAmount: "1", hash })).toBe(false);
  });

  it("creates status inquiry and refund tokens using their separate formulas", () => {
    expect(createStatusToken({ ...credentials, merchantOid: "CL20260001" })).toBe(
      "97XeInSE69HFHmMh7a1vJtW6XOcB97jDtgWfvC4QQkE=",
    );
    expect(
      createRefundToken({ ...credentials, merchantOid: "CL20260001", returnAmount: "1199.00" }),
    ).toBe("6hvxjUf6n3SjnsIWTaoob7sI8AM0nLz2HQ28XpoNziE=");
  });
});

describe("PAYTR amount and basket encoding", () => {
  it("formats integer kuruş as a dot-decimal refund amount without floating point math", () => {
    expect(formatKurusAsPaytrAmount(119_900)).toBe("1199.00");
    expect(formatKurusAsPaytrAmount(1)).toBe("0.01");
  });

  it("encodes the server-calculated basket in PAYTR's Base64 JSON shape", () => {
    expect(encodeBasket([{ name: "Baggy", unitPriceAmount: 119_900, quantity: 1 }])).toBe(
      "W1siQmFnZ3kiLCIxMTk5LjAwIiwxXV0=",
    );
  });
});
