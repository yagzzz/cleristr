import { z } from "zod";

export const passwordPolicy = z
  .string()
  .min(12, "Şifre en az 12 karakter olmalı.")
  .max(128, "Şifre en fazla 128 karakter olabilir.")
  .regex(/[a-zçğıöşü]/i, "Şifre en az bir harf içermeli.")
  .regex(/[0-9]/, "Şifre en az bir rakam içermeli.")
  .regex(/[^\p{L}\p{N}]/u, "Şifre en az bir özel karakter içermeli.");

const resetSchema = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Şifre yenileme bağlantısı geçersiz."), password: passwordPolicy, confirmPassword: z.string() });

export function parsePasswordResetSubmission(input: unknown) {
  const parsed = resetSchema.parse(input);
  if (parsed.password !== parsed.confirmPassword) throw new Error("Şifreler eşleşmiyor.");
  return { token: parsed.token, password: parsed.password };
}
