import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { listPublishedProducts } from "@/modules/catalog/queries";

export const metadata: Metadata = { title: "Arama", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const products = q.trim() ? await listPublishedProducts(q) : [];

  return (
    <section className="site-container min-h-[65svh] py-12 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow mb-4">ARAMA</p>
        <h1 className="text-5xl font-black tracking-[-0.055em] sm:text-7xl">Ne arıyorsun?</h1>
        <form action="/arama" className="mt-10 flex border-b-2 border-ink">
          <label htmlFor="search-query" className="sr-only">Ürün ara</label>
          <input id="search-query" name="q" defaultValue={q} autoFocus type="search" placeholder="Ürün, kategori veya koleksiyon" className="h-16 min-w-0 flex-1 bg-transparent text-lg outline-none" />
          <button type="submit" className="grid w-16 place-items-center" aria-label="Ara"><Search aria-hidden="true" /></button>
        </form>

        {q.trim() ? (
          <div className="mt-14">
            <p className="mb-8 text-sm text-muted">“{q}” için {products.length} sonuç</p>
            {products.length > 0 ? (
              <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="border border-dashed border-black/25 p-10 text-center">
                <h2 className="text-xl font-bold">Sonuç bulunamadı</h2>
                <p className="mt-2 text-sm text-muted">Daha kısa bir kelime deneyin veya mağazaya dönün.</p>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted">Aramaya başlamak için ürün adını yazın.</p>
        )}
      </div>
    </section>
  );
}
