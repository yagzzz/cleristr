import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ödeme sonucu", robots: { index: false, follow: false } };

export default function PaymentSuccessPage() {
  return <section className="site-container grid min-h-[55svh] place-items-center py-12 text-center"><div className="max-w-lg"><p className="eyebrow mb-4">ÖDEME DURUMU</p><h1 className="text-5xl font-black tracking-tight">Ödemen kontrol ediliyor.</h1><p className="mt-4 text-muted">Ödeme ekranından dönüş, siparişin onaylandığı anlamına gelmez. CLERIS yalnızca PAYTR&apos;ın doğrulanmış bildirimi geldikten sonra siparişi onaylar.</p><Link href="/hesabim" className="primary-button mt-8">Hesabıma git</Link></div></section>;
}
