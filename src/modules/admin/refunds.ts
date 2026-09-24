export function getRefundableAmount(capturedAmount: number, completedRefunds: number[]) {
  if (!Number.isSafeInteger(capturedAmount) || capturedAmount < 0 || completedRefunds.some((amount) => !Number.isSafeInteger(amount) || amount < 0)) {
    throw new Error("Ödeme tutarı geçersiz.");
  }
  return Math.max(0, capturedAmount - completedRefunds.reduce((sum, amount) => sum + amount, 0));
}
