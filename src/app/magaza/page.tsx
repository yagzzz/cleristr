import type { Metadata } from "next";
import { ProductCard } from "@/components/store/product-card";
import { listPublishedProducts } from "@/modules/catalog/queries";
import { ShopDiscoveryBar } from "@/components/store/shop-discovery-bar";

export const metadata: Metadata = {
  title: "Mağaza",
  description: "CLERIS ürünlerini keşfedin.",
  alternates: { canonical: "/magaza" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; availability?: string; priced?: string }> }) {
  const params = await searchParams;
  const filters = {
    search: params.q?.slice(0, 80) || "",
    category: params.category?.match(/^[a-z0-9-]+$/) ? params.category : "all",
    availability: params.availability === "in_stock" ? "in_stock" as const : "all" as const,
    priced: params.priced === "1",
  };
  const [products, allProducts] = await Promise.all([listPublishedProducts(filters), listPublishedProducts()]);
  const categories = [...new Map(allProducts.filter((product) => product.categorySlug && product.categoryName).map((product) => [product.categorySlug!, { slug: product.categorySlug!, label: product.categoryName! }])).values()];

  return (
    <section className="site-container py-10 sm:py-16">
      <div className="mb-9 flex flex-col gap-6 border-b border-black/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-4">CLERIS STORE</p>
          <h1 className="text-5xl font-black tracking-[-0.055em] sm:text-7xl">Mağaza</h1>
          <p className="mt-4 max-w-xl text-muted">Yalnızca gerçek katalog ürünleri gösterilir. Yeni kategori ve koleksiyonlar admin panelinden yayınlandığında otomatik eklenir.</p>
        </div>
        <p className="text-sm font-semibold">{products.length} ürün</p>
      </div>

      <ShopDiscoveryBar categories={categories} filters={filters} />
      <div className="mt-10">
        {products.length > 0 ? (
          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center border border-dashed border-black/25 p-8 text-center">
            <div><h2 className="text-2xl font-bold">Henüz yayınlanmış ürün yok</h2><p className="mt-2 text-muted">Katalog admin panelinden yönetilir.</p></div>
          </div>
        )}
      </div>
    </section>
  );
}
