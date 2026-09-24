import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { products } from "@/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.APP_URL || "https://cleristr.com";
  const catalog = await db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.status, "published"));
  return [
    { url: origin, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/magaza`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...catalog.map((product) => ({ url: `${origin}/urun/${product.slug}`, lastModified: new Date(product.updatedAt), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
