import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ödeme tamamlanamadı", robots: { index: false, follow: false } };

export default function PaymentFailurePage() {
  return <section className="site-container grid min-h-[55svh] place-items-center py-12 text-center"><div className="max-w-lg"><p className="eyebrow mb-4">ÖDEME DURUMU</p><h1 className="text-5xl font-black tracking-tight">Ödeme tamamlanamadı.</h1><p className="mt-4 text-muted">Kartınızdan tahsilat yapılıp yapılmadığını sipariş durumundan kontrol edin. Sorun sürerse destek ekibine ulaşın.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/sepet" className="primary-button">Sepete dön</Link><Link href="/hesabim" className="secondary-button">Hesabıma git</Link></div></div></section>;
}
