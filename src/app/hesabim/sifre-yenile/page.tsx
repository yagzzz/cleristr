import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Yeni şifre", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const valid = Boolean(token && /^[A-Za-z0-9_-]{43}$/.test(token));
  return <AuthShell eyebrow="HESAP GÜVENLİĞİ" title="Yeni şifre oluştur" description="Güçlü yeni şifreni belirle. Bu işlem açık oturumlarını kapatır." alternate={{ label: "Yeni bağlantıya mı ihtiyacın var?", href: "/hesabim/sifremi-unuttum", action: "Bağlantı iste" }}>{valid ? <ResetPasswordForm token={token!} /> : <div><p className="auth-notice" role="alert">Şifre yenileme bağlantısı geçersiz veya eksik.</p><Link href="/hesabim/sifremi-unuttum" className="primary-button w-full">Yeni bağlantı iste</Link></div>}</AuthShell>;
}
