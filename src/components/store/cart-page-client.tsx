"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatTry } from "./product-card";
import { useStore } from "./store-provider";

type CatalogItem = {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantName: string;
  priceAmount: number | null;
  fallbackPriceAmount: number | null;
  stockQuantity: number;
  status: "active" | "disabled" | "out_of_stock";
  allowPreorder: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
};

export function CartPageClient({ catalog }: { catalog: CatalogItem[] }) {
  const { cartItems, removeCartItem, setCartQuantity } = useStore();
  const entries = cartItems.map((item) => ({ item, catalog: catalog.find((entry) => entry.variantId === item.variantId) })).filter((entry): entry is { item: typeof cartItems[number]; catalog: CatalogItem } => Boolean(entry.catalog));
  const subtotal = entries.reduce((sum, entry) => {
    const price = entry.catalog.priceAmount ?? entry.catalog.fallbackPriceAmount ?? 0;
    return sum + price * entry.item.quantity;
  }, 0);
  const canCheckout = entries.length > 0 && entries.every((entry) => {
    const price = entry.catalog.priceAmount ?? entry.catalog.fallbackPriceAmount;
    return price !== null && price > 0 && entry.catalog.status === "active" && (entry.catalog.stockQuantity >= entry.item.quantity || entry.catalog.allowPreorder);
  });

  if (entries.length === 0) {
    return (
      <div className="grid min-h-[50svh] place-items-center text-center">
        <div><h1 className="text-4xl font-black tracking-tight">Sepetin boş</h1><p className="mt-3 text-muted">İlk CLERIS ürününü mağazada inceleyebilirsin.</p><Link href="/magaza" className="primary-button mt-7">Mağazaya git</Link></div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="divide-y divide-black/15 border-y border-black/15">
        {entries.map(({ item, catalog: product }) => {
          const price = product.priceAmount ?? product.fallbackPriceAmount;
          return (
            <article key={item.variantId} className="grid grid-cols-[6rem_1fr] gap-4 py-5 sm:grid-cols-[8rem_1fr_auto]">
              <Link href={`/urun/${product.productSlug}`} className="relative aspect-[3/4] overflow-hidden bg-stone">
                {product.imageUrl ? <Image src={product.imageUrl} alt={product.imageAlt || product.productName} fill sizes="128px" className="object-cover" /> : null}
              </Link>
              <div>
                <Link href={`/urun/${product.productSlug}`} className="font-bold underline-offset-4 hover:underline">{product.productName}</Link>
                <p className="mt-1 text-sm text-muted">Beden: {product.variantName}</p>
                <p className="mt-2 text-sm font-semibold">{price ? formatTry(price) : "Fiyat yakında"}</p>
                <div className="mt-4 inline-flex items-center border border-black/20">
                  <button type="button" className="grid h-9 w-9 place-items-center" onClick={() => setCartQuantity(item.variantId, item.quantity - 1)} aria-label="Adedi azalt"><Minus size={15} /></button>
                  <span className="min-w-9 text-center text-sm" aria-live="polite">{item.quantity}</span>
                  <button type="button" className="grid h-9 w-9 place-items-center" onClick={() => setCartQuantity(item.variantId, item.quantity + 1)} aria-label="Adedi artır"><Plus size={15} /></button>
                </div>
              </div>
              <div className="col-start-2 flex items-end justify-between gap-4 sm:col-start-auto sm:flex-col sm:items-end">
                <p className="font-bold">{price ? formatTry(price * item.quantity) : "—"}</p>
                <button type="button" onClick={() => removeCartItem(item.variantId)} className="inline-flex items-center gap-2 text-sm text-muted hover:text-danger"><Trash2 size={16} /> Kaldır</button>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="h-fit border border-black/15 bg-white p-6">
        <h2 className="text-xl font-bold">Sipariş özeti</h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Ara toplam</dt><dd>{subtotal > 0 ? formatTry(subtotal) : "—"}</dd></div>
          <div className="flex justify-between text-muted"><dt>Kargo</dt><dd>Checkout&apos;ta hesaplanır</dd></div>
          <div className="flex justify-between border-t border-black/15 pt-4 text-base font-bold"><dt>Toplam</dt><dd>{subtotal > 0 ? formatTry(subtotal) : "—"}</dd></div>
        </dl>
        <Link href={canCheckout ? "/checkout" : "#"} aria-disabled={!canCheckout} className={`primary-button mt-6 w-full ${canCheckout ? "" : "pointer-events-none opacity-50"}`}>
          Checkout&apos;a ilerle
        </Link>
        {!canCheckout ? <p className="mt-3 text-xs leading-5 text-muted">Gerçek fiyat ve stok tanımlanmayan ürünlerle ödeme başlatılamaz.</p> : null}
      </aside>
    </div>
  );
}
