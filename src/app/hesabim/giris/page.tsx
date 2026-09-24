import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Giriş yap", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ verified?: string; oauth?: string }> }) {
  const { verified, oauth } = await searchParams;
  return <AuthShell eyebrow="HESABIN" title="Giriş yap" description="Favorilerin ve sipariş adımların için güvenli alanına dön." alternate={{ label: "İlk kez mi buradasın?", href: "/hesabim/kayit", action: "Hesap oluştur" }}>{verified === "1" ? <p className="auth-notice auth-notice-success" role="status">E-posta adresin doğrulandı. Şimdi giriş yapabilirsin.</p> : null}{verified === "invalid" ? <p className="auth-notice" role="alert">Doğrulama bağlantısı geçersiz veya süresi dolmuş.</p> : null}{oauth === "unavailable" ? <p className="auth-notice" role="status">Google girişi henüz sunucu ayarlarında etkin değil.</p> : null}{oauth === "failed" ? <p className="auth-notice" role="alert">Google girişi tamamlanamadı. Tekrar deneyebilir veya e-posta ile giriş yapabilirsin.</p> : null}<LoginForm /></AuthShell>;
}
