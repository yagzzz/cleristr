import { createHmac, timingSafeEqual } from "node:crypto";

type Credentials = {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
};

function hmacBase64(message: string, key: string) {
  return createHmac("sha256", key).update(message, "utf8").digest("base64");
}

export function createIframeToken(
  input: Credentials & {
    userIp: string;
    merchantOid: string;
    email: string;
    paymentAmount: string;
    userBasket: string;
    noInstallment: string;
    maxInstallment: string;
    currency: string;
    testMode: string;
  },
) {
  const message = [
    input.merchantId,
    input.userIp,
    input.merchantOid,
    input.email,
    input.paymentAmount,
    input.userBasket,
    input.noInstallment,
    input.maxInstallment,
    input.currency,
    input.testMode,
    input.merchantSalt,
  ].join("");
  return hmacBase64(message, input.merchantKey);
}

export function createCallbackHash(
  input: Credentials & { merchantOid: string; status: string; totalAmount: string },
) {
  return hmacBase64(
    `${input.merchantOid}${input.merchantSalt}${input.status}${input.totalAmount}`,
    input.merchantKey,
  );
}

export function verifyCallbackHash(
  input: Credentials & {
    merchantOid: string;
    status: string;
    totalAmount: string;
    hash: string;
  },
) {
  const expected = Buffer.from(createCallbackHash(input), "base64");
  const actual = Buffer.from(input.hash, "base64");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createRefundToken(
  input: Credentials & { merchantOid: string; returnAmount: string },
) {
  return hmacBase64(
    `${input.merchantId}${input.merchantOid}${input.returnAmount}${input.merchantSalt}`,
    input.merchantKey,
  );
}

export function createStatusToken(input: Credentials & { merchantOid: string }) {
  return hmacBase64(
    `${input.merchantId}${input.merchantOid}${input.merchantSalt}`,
    input.merchantKey,
  );
}

export function formatKurusAsPaytrAmount(amount: number) {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("Tutar geçersiz");
  const whole = Math.floor(amount / 100);
  const fraction = String(amount % 100).padStart(2, "0");
  return `${whole}.${fraction}`;
}

export function encodeBasket(
  lines: Array<{ name: string; unitPriceAmount: number; quantity: number }>,
) {
  const basket = lines.map((line) => {
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new Error("Adet geçersiz");
    }
    return [line.name, formatKurusAsPaytrAmount(line.unitPriceAmount), line.quantity];
  });
  return Buffer.from(JSON.stringify(basket), "utf8").toString("base64");
}
