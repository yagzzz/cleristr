import Image from "next/image";
import Link from "next/link";
import { WishlistButton } from "./wishlist-button";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  priceAmount: number | null;
  compareAtAmount: number | null;
  stockQuantity: number;
  allowPreorder: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  categoryName: string | null;
  brandName: string | null;
};

export function formatTry(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const purchasable = product.priceAmount !== null && product.priceAmount > 0 && (product.stockQuantity > 0 || product.allowPreorder);

  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-stone">
        <Link href={`/urun/${product.slug}`} className="block h-full" aria-label={`${product.name} ürününü incele`}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt || product.name}
              fill
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              priority={priority}
            />
          ) : (
            <span className="grid h-full place-items-center text-sm text-muted">Görsel hazırlanıyor</span>
          )}
        </Link>
        <WishlistButton productId={product.id} className="absolute right-3 top-3 bg-canvas/90 shadow-sm" />
        {!purchasable && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white">
            Satışa hazırlanıyor
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-4 pt-4">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {product.brandName || "CLERIS"} {product.categoryName ? `· ${product.categoryName}` : ""}
          </p>
          <h3 className="text-base font-semibold leading-6">
            <Link href={`/urun/${product.slug}`} className="underline-offset-4 hover:underline">
              {product.name}
            </Link>
          </h3>
        </div>
        <div className="shrink-0 text-right">
          {product.priceAmount !== null && product.priceAmount > 0 ? (
            <>
              <p className="font-semibold">{formatTry(product.priceAmount)}</p>
              {product.compareAtAmount && product.compareAtAmount > product.priceAmount ? (
                <p className="text-xs text-muted line-through">{formatTry(product.compareAtAmount)}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm font-medium text-muted">Fiyat yakında</p>
          )}
        </div>
      </div>
    </article>
  );
}
