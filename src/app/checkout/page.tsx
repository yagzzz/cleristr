import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { CheckoutClient } from "@/components/store/checkout-client";
import { db } from "@/db/client";
import { shippingMethods } from "@/db/schema";
import { getCartCatalog } from "@/modules/catalog/queries";

export const metadata: Metadata = { title: "Güvenli ödeme", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const [catalog, methods] = await Promise.all([
    getCartCatalog(),
    db
      .select({
        id: shippingMethods.id,
        name: shippingMethods.name,
        description: shippingMethods.description,
        basePriceAmount: shippingMethods.basePriceAmount,
        freeThresholdAmount: shippingMethods.freeThresholdAmount,
        estimatedMinDays: shippingMethods.estimatedMinDays,
        estimatedMaxDays: shippingMethods.estimatedMaxDays,
      })
      .from(shippingMethods)
      .where(eq(shippingMethods.isActive, true))
      .orderBy(asc(shippingMethods.sortOrder)),
  ]);
  return <CheckoutClient catalog={catalog} shippingMethods={methods} />;
}
