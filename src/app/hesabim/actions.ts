"use server";

import { createHash, randomUUID } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { accountTokens, sessions, users } from "@/db/schema";
import { createSessionToken, hashPassword, hashSessionToken, verifyPassword } from "@/modules/auth/crypto";
import { parsePasswordResetSubmission, passwordPolicy } from "@/modules/auth/password-reset";
import { enforceRateLimit, RateLimitError } from "@/modules/auth/rate-limit";
import { createSession, deleteCurrentSession } from "@/modules/auth/session";
import { sendEmail } from "@/modules/notifications/email-provider";

export type AuthFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const emailSchema = z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin.").max(100);
const passwordSchema = passwordPolicy;

const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Ad en az 2 karakter olmalı.").max(60),
  lastName: z.string().trim().min(2, "Soyad en az 2 karakter olmalı.").max(60),
  email: emailSchema,
  password: passwordSchema,
  terms: z.literal("on", { error: "Kullanım koşullarını kabul etmelisiniz." }),
  marketing: z.string().optional(),
});

const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Şifrenizi girin.").max(128) });

async function requestFingerprint(email: string) {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  return {
    rateKey: `${email}:${ip}`,
    ipHash: createHash("sha256").update(ip).digest("hex"),
    userAgent: requestHeaders.get("user-agent") || undefined,
  };
}

export async function registerAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    terms: formData.get("terms"),
    marketing: formData.get("marketing") ?? undefined,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { rateKey } = await requestFingerprint(parsed.data.email);
  try {
    await enforceRateLimit({ action: "register", key: rateKey, limit: 3, windowSeconds: 3600 });
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (existing.length > 0) {
    return { message: "Bu e-posta ile zaten bir hesap bulunuyor. Giriş yapmayı deneyin." };
  }

  const now = new Date();
  const userId = randomUUID();
  const verificationToken = createSessionToken();
  await db.batch([
    db.insert(users).values({
      id: userId,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      role: "customer",
      status: "active",
      marketingEmailOptIn: parsed.data.marketing === "on",
      marketingSmsOptIn: false,
      totpEnabled: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }),
    db.insert(accountTokens).values({
      id: randomUUID(),
      userId,
      type: "email_verification",
      tokenHash: hashSessionToken(verificationToken),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now.toISOString(),
    }),
  ]);

  const verificationUrl = `${process.env.APP_URL || "http://localhost:3000"}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
  await sendEmail({
    to: parsed.data.email,
    subject: "CLERIS e-posta doğrulama",
    text: `E-posta adresinizi doğrulamak için bu bağlantıyı açın: ${verificationUrl}`,
  });

  return { ok: true, message: "Hesap oluşturuldu. Giriş yapmadan önce e-posta adresinizi doğrulayın." };
}

export async function loginAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const fingerprint = await requestFingerprint(parsed.data.email);
  try {
    await enforceRateLimit({ action: "login", key: fingerprint.rateKey, limit: 5, windowSeconds: 900, blockSeconds: 900 });
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  const rows = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { message: "E-posta veya şifre hatalı." };
  }
  if (!user.emailVerifiedAt) {
    return { message: "Giriş yapmadan önce e-posta adresinizi doğrulayın." };
  }
  if (user.status !== "active") return { message: "Bu hesap şu anda kullanılamıyor." };

  await db.update(users).set({ lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).where(eq(users.id, user.id));
  await createSession(user.id, fingerprint);
  redirect(user.role === "customer" ? "/hesabim" : "/admin");
}

export async function requestPasswordResetAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  const generic = { ok: true, message: "Bu adresle bir hesap varsa şifre yenileme bağlantısı gönderildi." };
  if (!parsed.success) return generic;
  const { rateKey } = await requestFingerprint(parsed.data);
  try {
    await enforceRateLimit({ action: "password_reset_request", key: rateKey, limit: 3, windowSeconds: 3600, blockSeconds: 3600 });
  } catch (error) {
    if (error instanceof RateLimitError) return { message: "Güvenlik nedeniyle daha sonra tekrar deneyin." };
    throw error;
  }
  const user = (await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data)).limit(1))[0];
  if (!user) return generic;

  const token = createSessionToken();
  const now = new Date();
  await db.insert(accountTokens).values({
    id: randomUUID(), userId: user.id, type: "password_reset", tokenHash: hashSessionToken(token),
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), createdAt: now.toISOString(),
  });
  const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/hesabim/sifre-yenile?token=${encodeURIComponent(token)}`;
  try {
    await sendEmail({ to: parsed.data, subject: "CLERIS şifre yenileme", text: `Şifrenizi yenilemek için bu bağlantıyı 1 saat içinde açın: ${resetUrl}` });
  } catch {
    // Do not expose provider configuration or account existence to the browser.
  }
  return generic;
}

export async function resetPasswordAction(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  let input: { token: string; password: string };
  try {
    input = parsePasswordResetSubmission({ token: formData.get("token"), password: formData.get("password"), confirmPassword: formData.get("confirmPassword") });
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Şifre yenileme bilgileri geçersiz." };
  }
  try {
    await enforceRateLimit({ action: "password_reset_submit", key: hashSessionToken(input.token), limit: 5, windowSeconds: 3600, blockSeconds: 3600 });
  } catch (error) {
    if (error instanceof RateLimitError) return { message: "Güvenlik nedeniyle daha sonra tekrar deneyin." };
    throw error;
  }
  const record = (await db.select({ id: accountTokens.id, userId: accountTokens.userId }).from(accountTokens).where(and(eq(accountTokens.type, "password_reset"), eq(accountTokens.tokenHash, hashSessionToken(input.token)), isNull(accountTokens.consumedAt), gt(accountTokens.expiresAt, new Date().toISOString()))).limit(1))[0];
  if (!record) return { message: "Şifre yenileme bağlantısı geçersiz veya süresi dolmuş." };
  const now = new Date().toISOString();
  await db.batch([
    db.update(users).set({ passwordHash: await hashPassword(input.password), updatedAt: now }).where(eq(users.id, record.userId)),
    db.update(accountTokens).set({ consumedAt: now }).where(and(eq(accountTokens.userId, record.userId), eq(accountTokens.type, "password_reset"), isNull(accountTokens.consumedAt))),
    db.delete(sessions).where(eq(sessions.userId, record.userId)),
  ]);
  return { ok: true, message: "Şifreniz yenilendi. Güvenlik için tüm oturumlar kapatıldı; yeni şifrenizle giriş yapın." };
}

export async function logoutAction() {
  await deleteCurrentSession();
  redirect("/");
}
