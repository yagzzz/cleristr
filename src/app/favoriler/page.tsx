import type { Metadata } from "next";
import { WishlistPageClient } from "@/components/store/wishlist-page-client";
import { listPublishedProducts } from "@/modules/catalog/queries";

export const metadata: Metadata = { title: "Favoriler", robots: { index: false, follow: false } };

export default async function WishlistPage() {
  const products = await listPublishedProducts();
  return (
    <section className="site-container py-10 sm:py-16">
      <div className="mb-10"><p className="eyebrow mb-4">HESABIN</p><h1 className="text-5xl font-black tracking-[-0.055em] sm:text-7xl">Favoriler</h1></div>
      <WishlistPageClient products={products} />
    </section>
  );
}
