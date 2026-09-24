import type { Metadata } from "next";
import { CartPageClient } from "@/components/store/cart-page-client";
import { getCartCatalog } from "@/modules/catalog/queries";

export const metadata: Metadata = { title: "Sepet", robots: { index: false, follow: false } };

export default async function CartPage() {
  const catalog = await getCartCatalog();
  return <section className="site-container py-10 sm:py-16"><CartPageClient catalog={catalog} /></section>;
}
