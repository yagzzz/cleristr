"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CartItem = { productId: string; variantId: string; quantity: number };

type StoreContextValue = {
  cartItems: CartItem[];
  wishlistProductIds: string[];
  cartCount: number;
  wishlistCount: number;
  addCartItem: (item: CartItem) => void;
  removeCartItem: (variantId: string) => void;
  setCartQuantity: (variantId: string, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = "cleris_cart_v1";
const WISHLIST_KEY = "cleris_wishlist_v1";

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCartItems(readStored<CartItem[]>(CART_KEY, []));
      setWishlistProductIds(readStored<string[]>(WISHLIST_KEY, []));
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistProductIds));
  }, [wishlistProductIds, hydrated]);

  const addCartItem = useCallback((item: CartItem) => {
    setCartItems((current) => {
      const found = current.find((entry) => entry.variantId === item.variantId);
      if (!found) return [...current, { ...item, quantity: Math.min(99, Math.max(1, item.quantity)) }];
      return current.map((entry) =>
        entry.variantId === item.variantId
          ? { ...entry, quantity: Math.min(99, entry.quantity + item.quantity) }
          : entry,
      );
    });
  }, []);

  const removeCartItem = useCallback((variantId: string) => {
    setCartItems((current) => current.filter((item) => item.variantId !== variantId));
  }, []);

  const setCartQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity < 1) return removeCartItem(variantId);
    setCartItems((current) =>
      current.map((item) =>
        item.variantId === variantId ? { ...item, quantity: Math.min(99, quantity) } : item,
      ),
    );
  }, [removeCartItem]);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      cartItems,
      wishlistProductIds,
      cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      wishlistCount: wishlistProductIds.length,
      addCartItem,
      removeCartItem,
      setCartQuantity,
      toggleWishlist,
    }),
    [addCartItem, cartItems, removeCartItem, setCartQuantity, toggleWishlist, wishlistProductIds],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
