import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="site-container grid gap-12 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="relative mb-6 h-12 w-44">
            <Image src="/media/brand/cleris-white.webp" alt="CLERIS" fill sizes="176px" className="object-contain object-left" />
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/65">
            CLERIS; giyim, aksesuar ve gelecekteki koleksiyonlar için özgün, yönetilebilir bir alışveriş deneyimi kurar.
          </p>
        </div>
        <div>
          <h2 className="footer-title">Alışveriş</h2>
          <div className="footer-links">
            <Link href="/magaza">Mağaza</Link>
            <Link href="/favoriler">Favoriler</Link>
            <Link href="/sepet">Sepet</Link>
            <Link href="/arama">Arama</Link>
          </div>
        </div>
        <div>
          <h2 className="footer-title">Hesap</h2>
          <div className="footer-links">
            <Link href="/hesabim">Hesabım</Link>
            <Link href="/hesabim/giris">Giriş yap</Link>
            <Link href="/hesabim/kayit">Kayıt ol</Link>
            <Link href="/#newsletter">Newsletter</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="site-container flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} CLERIS</span>
          <span>Fiyat, stok, kargo ve ödeme ayarları gerçek verilerle etkinleştirilir.</span>
        </div>
      </div>
    </footer>
  );
}
