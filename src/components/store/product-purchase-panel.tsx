"use client";

import { Heart, Ruler, ShoppingBag, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatTry } from "./product-card";
import { PaymentDisclosure } from "./payment-disclosure";
import { useStore } from "./store-provider";

type Variant = {
  id: string;
  name: string;
  sku: string;
  priceAmount: number | null;
  stockQuantity: number;
  status: "active" | "disabled" | "out_of_stock";
  attributeValue: string | null;
};

export function ProductPurchasePanel({
  product,
  variants,
}: {
  product: {
    id: string;
    name: string;
    sku: string;
    priceAmount: number | null;
    compareAtAmount: number | null;
    allowPreorder: boolean;
  };
  variants: Variant[];
}) {
  const { addCartItem, toggleWishlist, wishlistProductIds } = useStore();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const selected = variants.find((variant) => variant.id === selectedId) ?? null;
  const price = selected?.priceAmount ?? product.priceAmount;
  const available = Boolean(
    selected &&
      price !== null &&
      price > 0 &&
      selected.status === "active" &&
      (selected.stockQuantity > 0 || product.allowPreorder),
  );
  const inWishlist = wishlistProductIds.includes(product.id);

  function addToCart() {
    if (!selected || !available) return;
    addCartItem({ productId: product.id, variantId: selected.id, quantity: 1 });
    setMessage("Ürün sepete eklendi.");
  }

  function startCheckout() {
    if (!selected || !available) return;
    addCartItem({ productId: product.id, variantId: selected.id, quantity: 1 });
    router.push("/checkout");
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">CLERIS · {product.sku}</p>
      <h1 className="mt-3 text-4xl font-black leading-[0.98] tracking-[-0.045em] sm:text-5xl">{product.name}</h1>

      <div className="mt-6 flex items-baseline gap-3">
        {price !== null && price > 0 ? (
          <>
            <p className="text-2xl font-bold">{formatTry(price)}</p>
            {product.compareAtAmount && product.compareAtAmount > price ? (
              <p className="text-base text-muted line-through">{formatTry(product.compareAtAmount)}</p>
            ) : null}
          </>
        ) : (
          <div>
            <p className="text-lg font-semibold">Fiyat bilgisi yakında</p>
            <p className="mt-1 text-sm text-muted">Gerçek satış fiyatı admin panelinden girilmeden ödeme açılmaz.</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Beden seçin</span>
          <button type="button" className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4" onClick={() => setMessage("Beden rehberi gerçek ölçüler eklendiğinde burada açılacak.")}>
            <Ruler size={16} aria-hidden="true" /> Beden rehberi
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Beden">
          {variants.map((variant) => {
            const canSelect = variant.status === "active" && (variant.stockQuantity > 0 || product.allowPreorder);
            return (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={selectedId === variant.id}
                disabled={!canSelect}
                onClick={() => setSelectedId(variant.id)}
                className={`h-12 border text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:bg-stone disabled:text-muted/60 ${selectedId === variant.id ? "border-ink bg-ink text-white" : "border-black/20 bg-white"}`}
              >
                {variant.attributeValue || variant.name}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-muted">
          Stok adetleri henüz girilmedi. Bedenler satış açılana kadar seçilemez.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-[1fr_auto] gap-2">
        <button type="button" className="primary-button h-14" disabled={!available} onClick={addToCart}>
          <ShoppingBag size={19} aria-hidden="true" />
          {available ? "Sepete ekle" : "Satışa hazırlanıyor"}
        </button>
        <button
          type="button"
          className="icon-button h-14 w-14 border border-black/20"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={inWishlist}
          aria-label={inWishlist ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
          <Heart aria-hidden="true" className={inWishlist ? "fill-current" : ""} />
        </button>
      </div>

      <div className="mt-6 flex items-start gap-3 border-t border-black/10 pt-5 text-sm text-muted">
        <Truck size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p>Kargo firması, ücret ve tahmini teslimat gerçek ayarlar tanımlandığında otomatik hesaplanır.</p>
      </div>

      <PaymentDisclosure selected={Boolean(selected)} available={available} priceAmount={price} onCheckout={startCheckout} />

      <p className="mt-4 min-h-6 text-sm font-medium" aria-live="polite">{message}</p>
    </div>
  );
}
