import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import { CardSwipe } from "@/components/store/card-swipe";
import { getProductBySlug } from "@/modules/catalog/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün bulunamadı" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || undefined,
    alternates: { canonical: `/urun/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.shortDescription || undefined,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const galleryItems = product.media
    .filter((item) => item.type === "image" || item.type === "video")
    .map((item) => ({ ...item, type: item.type as "image" | "video" }));
  const details = Array.isArray(product.details)
    ? (product.details as Array<{ label: string; value: string }>)
    : [];
  const videos = product.media.filter((item) => item.type === "video").map((item) => item.url);
  const storyCards = [
    { id: "form", eyebrow: "01 / FORM", title: "FORM", description: product.shortDescription || "Kesim ve silueti gerçek ürün görseli üzerinden inceleyin.", imageUrl: product.imageUrl },
    { id: "detail", eyebrow: "02 / DETAIL", title: "DETAIL", description: "Video çekimindeki paça fermuarı ve logo detayları, ürünün yakın plan karakterini gösterir.", videoUrl: videos[0], imageUrl: product.imageUrl },
    { id: "move", eyebrow: "03 / MOVE", title: "MOVE", description: "Şehir içindeki hareket, kesimin duruşunu ve kumaş akışını tek kartta değil, gerçek videoda anlatır.", videoUrl: videos[1], imageUrl: product.imageUrl },
  ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: product.brandName ? { "@type": "Brand", name: product.brandName } : undefined,
    image: product.imageUrl ? [`${process.env.APP_URL || "https://cleristr.com"}${product.imageUrl}`] : undefined,
    description: product.shortDescription || product.description,
    offers:
      product.priceAmount && product.priceAmount > 0
        ? {
            "@type": "Offer",
            priceCurrency: "TRY",
            price: (product.priceAmount / 100).toFixed(2),
            availability:
              product.stockQuantity > 0 || product.allowPreorder
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: `${process.env.APP_URL || "https://cleristr.com"}/urun/${product.slug}`,
          }
        : undefined,
  };

  return (
    <>
      <div className="site-container py-5 text-xs text-muted">
        <nav aria-label="Sayfa yolu" className="flex items-center gap-2">
          <Link href="/">Ana Sayfa</Link><span aria-hidden="true">/</span>
          <Link href="/magaza">Mağaza</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>
      </div>

      <section className="site-container grid gap-10 pb-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <ProductGallery items={galleryItems} productName={product.name} />
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductPurchasePanel product={product} variants={product.variants} />

          <div className="mt-10 divide-y divide-black/15 border-y border-black/15">
            <details open className="group py-5">
              <summary className="cursor-pointer list-none font-bold">Ürün açıklaması</summary>
              <p className="mt-4 max-w-prose text-sm leading-7 text-muted">{product.description}</p>
            </details>
            <details className="group py-5">
              <summary className="cursor-pointer list-none font-bold">Ürün özellikleri</summary>
              <dl className="mt-4 grid gap-3 text-sm">
                {details.map((detail) => (
                  <div key={detail.label} className="grid grid-cols-[7rem_1fr] gap-3">
                    <dt className="text-muted">{detail.label}</dt><dd className="font-medium">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <details className="group py-5">
              <summary className="cursor-pointer list-none font-bold">Kargo ve iade</summary>
              <p className="mt-4 text-sm leading-7 text-muted">
                Gerçek kargo firması, teslimat süresi, ücret ve iade politikası admin panelinde onaylanmadan burada kesin vaat gösterilmez.
              </p>
            </details>
            <details className="group py-5">
              <summary className="cursor-pointer list-none font-bold">Yorumlar</summary>
              <p className="mt-4 text-sm leading-7 text-muted">Henüz onaylanmış müşteri yorumu yok.</p>
            </details>
          </div>
        </div>
      </section>

      <div className="site-container pb-20"><CardSwipe cards={storyCards} /></div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }} />
    </>
  );
}
