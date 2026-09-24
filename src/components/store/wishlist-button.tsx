"use client";

import { Heart } from "lucide-react";
import { useStore } from "./store-provider";

export function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { wishlistProductIds, toggleWishlist } = useStore();
  const active = wishlistProductIds.includes(productId);

  return (
    <button
      type="button"
      className={`icon-button ${className}`}
      onClick={() => toggleWishlist(productId)}
      aria-pressed={active}
      aria-label={active ? "Favorilerden çıkar" : "Favorilere ekle"}
    >
      <Heart aria-hidden="true" className={active ? "fill-current" : ""} />
    </button>
  );
}
