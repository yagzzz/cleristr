export function parsePaytrStatusResult(body: Record<string, unknown>) {
  if (body.status !== "success") {
    throw new Error(typeof body.err_msg === "string" ? body.err_msg : "PAYTR durum sorgusu başarısız.");
  }
  return {
    paymentAmount: String(body.payment_amount || ""),
    paymentTotal: String(body.payment_total || ""),
    currency: String(body.currency || "TL"),
    testMode: String(body.test_mode || "0") === "1",
    returns: Array.isArray(body.returns) ? body.returns : [],
  };
}
