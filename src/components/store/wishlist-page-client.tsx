"use client";

import Link from "next/link";
import { ProductCard, type ProductCardData } from "./product-card";
import { useStore } from "./store-provider";

export function WishlistPageClient({ products }: { products: ProductCardData[] }) {
  const { wishlistProductIds } = useStore();
  const wished = products.filter((product) => wishlistProductIds.includes(product.id));

  if (wished.length === 0) {
    return (
      <div className="grid min-h-[50svh] place-items-center text-center">
        <div><h1 className="text-4xl font-black tracking-tight">Favorilerin boş</h1><p className="mt-3 text-muted">Beğendiğin gerçek ürünleri burada saklayabilirsin.</p><Link href="/magaza" className="primary-button mt-7">Mağazaya git</Link></div>
      </div>
    );
  }

  return <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{wished.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
