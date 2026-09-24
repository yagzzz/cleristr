import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Kayıt ol", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return <AuthShell eyebrow="CLERIS ACCOUNT" title="Hesabını oluştur" description="Favorilerini, izinlerini ve sipariş sürecini tek bir güvenli alanda topla." alternate={{ label: "Zaten hesabın var mı?", href: "/hesabim/giris", action: "Giriş yap" }}><RegisterForm /></AuthShell>;
}
