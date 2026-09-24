import { createIframeToken } from "./signatures";

export type PaytrCredentials = { merchantId: string; merchantKey: string; merchantSalt: string };

type PaytrEnvironment = {
  PAYTR_MERCHANT_ID?: string;
  PAYTR_MERCHANT_KEY?: string;
  PAYTR_MERCHANT_SALT?: string;
};

export function parsePaytrCredentials(environment: PaytrEnvironment): PaytrCredentials {
  const merchantId = environment.PAYTR_MERCHANT_ID?.trim();
  const merchantKey = environment.PAYTR_MERCHANT_KEY?.trim();
  const merchantSalt = environment.PAYTR_MERCHANT_SALT?.trim();
  if (!merchantId || !merchantKey || !merchantSalt) throw new Error("PAYTR yapılandırması eksik.");
  return { merchantId, merchantKey, merchantSalt };
}

export function getPaytrCredentials() {
  return parsePaytrCredentials({
    PAYTR_MERCHANT_ID: process.env.PAYTR_MERCHANT_ID,
    PAYTR_MERCHANT_KEY: process.env.PAYTR_MERCHANT_KEY,
    PAYTR_MERCHANT_SALT: process.env.PAYTR_MERCHANT_SALT,
  });
}

type IframeTokenInput = {
  credentials: PaytrCredentials;
  userIp: string;
  merchantOid: string;
  email: string;
  paymentAmount: number;
  userBasket: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  okUrl: string;
  failUrl: string;
};

export async function requestPaytrIframeToken(input: IframeTokenInput) {
  const testMode = process.env.PAYTR_TEST_MODE === "1" ? "1" : "0";
  const noInstallment = "0";
  const maxInstallment = "0";
  const currency = "TL";
  const paymentAmount = String(input.paymentAmount);
  const paytrToken = createIframeToken({
    ...input.credentials,
    userIp: input.userIp,
    merchantOid: input.merchantOid,
    email: input.email,
    paymentAmount,
    userBasket: input.userBasket,
    noInstallment,
    maxInstallment,
    currency,
    testMode,
  });
  const form = new URLSearchParams({
    merchant_id: input.credentials.merchantId,
    user_ip: input.userIp,
    merchant_oid: input.merchantOid,
    email: input.email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: input.userBasket,
    debug_on: process.env.PAYTR_DEBUG_ON === "1" ? "1" : "0",
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: input.userName,
    user_address: input.userAddress,
    user_phone: input.userPhone,
    merchant_ok_url: input.okUrl,
    merchant_fail_url: input.failUrl,
    timeout_limit: process.env.PAYTR_TIMEOUT_MINUTES || "30",
    currency,
    test_mode: testMode,
    lang: "tr",
    iframe_v2: "1",
    iframe_v2_dark: "0",
  });

  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("PAYTR token servisine erişilemedi.");
  const body = (await response.json()) as { status?: string; token?: string; reason?: string };
  if (body.status !== "success" || !body.token) throw new Error(body.reason || "PAYTR ödeme formu oluşturulamadı.");
  return { token: body.token, testMode: testMode === "1" };
}
