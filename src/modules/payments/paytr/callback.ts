import { z } from "zod";

const callbackSchema = z.object({
  merchant_oid: z.string().regex(/^[a-zA-Z0-9]{6,64}$/, "Sipariş numarası geçersiz."),
  status: z.enum(["success", "failed"]),
  total_amount: z.string().regex(/^\d{1,12}$/, "Tahsilat tutarı geçersiz."),
  hash: z.string().min(20).max(200),
  payment_type: z.string().max(20).optional(),
  currency: z.string().max(10).optional(),
  payment_amount: z.string().regex(/^\d{1,12}$/).optional(),
  test_mode: z.string().optional(),
  failed_reason_code: z.string().max(30).optional(),
  failed_reason_msg: z.string().max(500).optional(),
});

export type PaytrCallback = {
  merchantOid: string;
  status: "success" | "failed";
  totalAmount: number;
  hash: string;
  paymentType?: string;
  currency?: string;
  paymentAmount?: number;
  testMode: boolean;
  failedReasonCode?: string;
  failedReasonMessage?: string;
};

export function parsePaytrCallback(input: Record<string, unknown>): PaytrCallback {
  const parsed = callbackSchema.parse(input);
  const totalAmount = Number(parsed.total_amount);
  const paymentAmount = parsed.payment_amount ? Number(parsed.payment_amount) : undefined;
  if (!Number.isSafeInteger(totalAmount) || !Number.isSafeInteger(paymentAmount ?? 0)) throw new Error("Tahsilat tutarı geçersiz.");
  return {
    merchantOid: parsed.merchant_oid,
    status: parsed.status,
    totalAmount,
    hash: parsed.hash,
    paymentType: parsed.payment_type,
    currency: parsed.currency,
    paymentAmount,
    testMode: parsed.test_mode === "1",
    failedReasonCode: parsed.failed_reason_code,
    failedReasonMessage: parsed.failed_reason_msg,
  };
}
