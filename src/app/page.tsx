import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { homeCopy } from "@/i18n/locale";
import { getLocale } from "@/i18n/server";
import { listPublishedProducts } from "@/modules/catalog/queries";
import { getHomepageSections } from "@/modules/content/queries";

export default async function Home() {
  const [products, sections, locale] = await Promise.all([listPublishedProducts(), getHomepageSections(), getLocale()]);
  const visible = new Set(sections.map((section) => section.type));
  const featured = products.filter((product) => product.isFeatured);
  const t = homeCopy[locale];

  return (
    <>
      {visible.has("hero") ? (
        <section className="site-container py-4 sm:py-6">
          <Link href="/urun/baggy-esofman-alti-unisex-oversize" className="hero-banner group relative block min-h-[76svh] overflow-hidden bg-ink" aria-label="Baggy Eşofman ürününü incele">
            <Image
              src="/media/products/baggy-esofman.webp"
              alt="Siyah CLERIS Baggy Eşofman"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[55%_center] transition-transform duration-700 ease-out group-hover:scale-[1.018] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/22 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white sm:p-10 lg:p-14"><div className="flex items-center justify-between"><span className="eyebrow rounded-[10px] border border-white/25 bg-black/20 px-3 py-2 text-white/75 backdrop-blur">CLERIS / DROP 001</span><span className="hidden rounded-[10px] border border-white/20 bg-black/15 px-3 py-2 text-xs font-bold text-white/80 backdrop-blur">UNISEX · OVERSIZE</span></div><div className="max-w-3xl"><p className="eyebrow mb-4 text-white/65">A NEW SILHOUETTE</p><h1 className="max-w-[9ch] text-[clamp(4.25rem,11vw,10.5rem)] font-black leading-[0.76] tracking-[-0.09em]">BAGGY<br /><span className="text-acid">FORM.</span></h1><p className="mt-7 max-w-md text-base leading-7 text-white/75 sm:text-lg">{t.heroNote}</p><span className="primary-button mt-8 w-fit border-white bg-white text-ink hover:border-acid hover:bg-acid">{t.inspect} <ArrowUpRight size={18} aria-hidden="true" /></span></div><div className="flex items-end justify-between"><span className="text-sm font-semibold text-white/70">{t.scroll}</span><span className="grid h-12 w-12 place-items-center rounded-[12px] bg-acid text-ink"><ArrowDownRight aria-hidden="true" /></span></div></div>
          </Link>
        </section>
      ) : null}

      {visible.has("featured_products") && featured.length > 0 ? (
        <section className="site-container py-24 sm:py-32">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-4">DROP 001</p>
              <h2 className="section-heading">{t.productIntro}</h2>
            </div>
            <Link href="/magaza" className="secondary-button self-start sm:self-auto">{t.allProducts}</Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, index) => <ProductCard key={product.id} product={product} priority={index === 0} />)}
          </div>
        </section>
      ) : null}

      {visible.has("brand_story") && featured[0] ? (
        <section className="site-container py-24 sm:py-32">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow mb-4">CLERIS NOTES</p><h2 className="section-heading">{t.notesTitle}</h2></div><p className="max-w-sm text-sm leading-6 text-muted">{t.notesText}</p></div>
          <div className="commerce-bento">
            <Link href={`/urun/${featured[0].slug}`} className="bento-card bento-product group"><Image src={featured[0].imageUrl || "/media/products/baggy-esofman.webp"} alt={featured[0].imageAlt || featured[0].name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" /><div className="bento-overlay"><p className="eyebrow text-white/70">REAL PRODUCT</p><p className="mt-2 text-3xl font-black">{featured[0].name}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">{t.openProduct} <ArrowUpRight size={16} /></span></div></Link>
            <article className="bento-card bento-copy"><p className="eyebrow">SILHOUETTE</p><p className="mt-5 text-2xl font-black leading-tight">{featured[0].shortDescription || "Ürün açıklaması yayınlandığında burada yer alır."}</p><p className="mt-5 text-sm leading-6 text-muted">{featured[0].categoryName || "Kategori"} · {featured[0].brandName || "CLERIS"}</p></article>
            <Link href={`/urun/${featured[0].slug}#product-stories`} className="bento-card bento-acid"><p className="eyebrow">MOTION NOTES</p><p className="mt-5 text-2xl font-black leading-tight">{t.motionTitle}</p><span className="mt-8 inline-flex items-center gap-2 text-sm font-bold">{t.discoverCards} <ArrowDownRight size={16} /></span></Link>
            <article className="bento-card bento-status"><p className="eyebrow">RELEASE STATE</p><p className="mt-4 text-3xl font-black">{featured[0].priceAmount ? t.releaseOpen : t.releasePending}</p><p className="mt-3 text-sm leading-6 text-muted">{featured[0].priceAmount ? "Fiyat ve stok, admin’de tanımlı veriden gelir." : "Fiyat ve varyasyon stokları doğrulanmadan ödeme başlatılmaz."}</p></article>
          </div>
        </section>
      ) : null}

      {visible.has("social") ? (
        <section className="site-container py-24 sm:py-32">
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow mb-4">HAREKET HALİNDE</p>
              <h2 className="section-heading">Ürünü yalnızca rafta göstermiyoruz.</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <VideoCard src="/media/reels/0221-720.mp4" poster="/media/reels/0221-poster.jpg" label="CLERIS Baggy ürün hikâyesi" />
            <VideoCard src="/media/reels/0223-720.mp4" poster="/media/reels/0223-poster.jpg" label="CLERIS Baggy paça ve logo detayları" />
          </div>
        </section>
      ) : null}

      {visible.has("newsletter") ? (
        <section id="newsletter" className="site-container mb-24 grid gap-8 border border-black/15 bg-white p-6 sm:p-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <ShieldCheck aria-hidden="true" className="mb-8" />
            <p className="eyebrow mb-4">İZİNLİ İLETİŞİM</p>
            <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">{t.newsletterTitle}</h2>
          </div>
          <form className="space-y-3" action="/api/newsletter" method="post">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">E-posta adresi</label>
              <input id="newsletter-email" name="email" type="email" required autoComplete="email" placeholder="E-posta adresiniz" className="h-14 min-w-0 flex-1 border border-black/25 bg-canvas px-4 outline-none focus:border-ink" />
              <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <button type="submit" className="primary-button h-14">{t.newsletterButton}</button>
            </div>
            <label className="flex items-start gap-2 text-xs leading-5 text-muted">
              <input type="checkbox" name="consent" required className="mt-1" />
              <span>{t.newsletterConsent}</span>
            </label>
          </form>
        </section>
      ) : null}
    </>
  );
}

function VideoCard({ src, poster, label }: { src: string; poster: string; label: string }) {
  return (
    <div className="relative aspect-[9/14] overflow-hidden bg-ink sm:aspect-[3/4]">
      <video controls playsInline preload="metadata" poster={poster} className="h-full w-full object-cover" aria-label={label}>
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
