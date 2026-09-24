import "server-only";

import { getPaytrCredentials } from "./client";
import { createRefundToken, createStatusToken, formatKurusAsPaytrAmount } from "./signatures";

import { parsePaytrStatusResult } from "./operations-parser";

export { parsePaytrStatusResult } from "./operations-parser";

async function postPaytr(url: string, form: URLSearchParams) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("PAYTR servisine erişilemedi.");
  return (await response.json()) as Record<string, unknown>;
}

export async function queryPaytrStatus(merchantOid: string) {
  if (!/^[a-zA-Z0-9]{6,64}$/.test(merchantOid)) throw new Error("Sipariş numarası geçersiz.");
  const credentials = getPaytrCredentials();
  const body = await postPaytr("https://www.paytr.com/odeme/durum-sorgu", new URLSearchParams({
    merchant_id: credentials.merchantId,
    merchant_oid: merchantOid,
    paytr_token: createStatusToken({ ...credentials, merchantOid }),
  }));
  return parsePaytrStatusResult(body);
}

export async function refundPaytrPayment({ merchantOid, amount, referenceNo }: { merchantOid: string; amount: number; referenceNo?: string }) {
  if (!/^[a-zA-Z0-9]{6,64}$/.test(merchantOid)) throw new Error("Sipariş numarası geçersiz.");
  if (!Number.isSafeInteger(amount) || amount < 1) throw new Error("İade tutarı geçersiz.");
  if (referenceNo && !/^[a-zA-Z0-9]{1,64}$/.test(referenceNo)) throw new Error("İade referansı geçersiz.");
  const credentials = getPaytrCredentials();
  const returnAmount = formatKurusAsPaytrAmount(amount);
  const body = await postPaytr("https://www.paytr.com/odeme/iade", new URLSearchParams({
    merchant_id: credentials.merchantId,
    merchant_oid: merchantOid,
    return_amount: returnAmount,
    paytr_token: createRefundToken({ ...credentials, merchantOid, returnAmount }),
    ...(referenceNo ? { reference_no: referenceNo } : {}),
  }));
  if (body.status !== "success") throw new Error(typeof body.err_msg === "string" ? body.err_msg : "PAYTR iadesi başarısız.");
  return { merchantOid: String(body.merchant_oid || merchantOid), returnAmount: String(body.return_amount || returnAmount), referenceNo: typeof body.reference_no === "string" ? body.reference_no : undefined, testMode: String(body.is_test || "0") === "1" };
}
