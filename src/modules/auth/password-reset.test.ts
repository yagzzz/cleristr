import { describe, expect, it } from "vitest";
import { parsePasswordResetSubmission } from "./password-reset";

describe("parsePasswordResetSubmission", () => {
  it("accepts matching strong passwords", () => {
    expect(parsePasswordResetSubmission({ token: "a".repeat(43), password: "StrongPass!2026", confirmPassword: "StrongPass!2026" })).toMatchObject({ password: "StrongPass!2026" });
  });

  it("rejects mismatched passwords", () => {
    expect(() => parsePasswordResetSubmission({ token: "a".repeat(43), password: "StrongPass!2026", confirmPassword: "OtherPass!2026" })).toThrow("Şifreler eşleşmiyor");
  });
});
