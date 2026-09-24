import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Newsletter sonucu", robots: { index: false, follow: false } };

export default async function NewsletterResultPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const ok = status === "ok";
  return <section className="site-container grid min-h-[55svh] place-items-center py-12 text-center"><div className="max-w-lg"><p className="eyebrow mb-4">CLERIS NEWSLETTER</p><h1 className="text-5xl font-black tracking-tight">{ok ? "Listeye eklendin." : "İşlem tamamlanamadı."}</h1><p className="mt-4 text-muted">{ok ? "İletişim tercihin kaydedildi. İznini daha sonra hesap ayarlarından veya e-postalardaki çıkış bağlantısından geri çekebilirsin." : "Bilgileri kontrol edip daha sonra tekrar deneyebilirsin."}</p><Link href="/" className="primary-button mt-8">Ana sayfaya dön</Link></div></section>;
}
