import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Şifremi unuttum", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <AuthShell eyebrow="HESAP GÜVENLİĞİ" title="Şifreni yenile" description="Kayıtlı e-posta adresine tek kullanımlık, bir saat geçerli bağlantı göndeririz." alternate={{ label: "Şifreni hatırladın mı?", href: "/hesabim/giris", action: "Giriş yap" }}><ForgotPasswordForm /></AuthShell>;
}
