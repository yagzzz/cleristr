import { and, asc, eq, gt, gte, like, or } from "drizzle-orm";
import { db } from "@/db/client";
import {
  attributeValues,
  brands,
  categories,
  mediaAssets,
  productMedia,
  productVariants,
  products,
  variantAttributeValues,
} from "@/db/schema";

export type ProductListFilters = { search?: string; category?: string; availability?: "all" | "in_stock"; priced?: boolean };

export async function listPublishedProducts(input?: string | ProductListFilters) {
  const filters = typeof input === "string" ? { search: input } : input || {};
  const conditions = [eq(products.status, "published")];
  if (filters.search?.trim()) conditions.push(or(like(products.name, `%${filters.search.trim()}%`), like(products.shortDescription, `%${filters.search.trim()}%`))!);
  if (filters.category && filters.category !== "all") conditions.push(eq(categories.slug, filters.category));
  if (filters.availability === "in_stock") conditions.push(or(gte(products.stockQuantity, 1), eq(products.allowPreorder, true))!);
  if (filters.priced) conditions.push(gt(products.priceAmount, 0));

  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      priceAmount: products.priceAmount,
      compareAtAmount: products.compareAtAmount,
      stockQuantity: products.stockQuantity,
      allowPreorder: products.allowPreorder,
      isFeatured: products.isFeatured,
      imageUrl: mediaAssets.url,
      imageAlt: mediaAssets.altText,
      imageWidth: mediaAssets.width,
      imageHeight: mediaAssets.height,
      categoryName: categories.name,
      categorySlug: categories.slug,
      brandName: brands.name,
    })
    .from(products)
    .leftJoin(mediaAssets, eq(products.mainMediaId, mediaAssets.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(...conditions))
    .orderBy(asc(products.createdAt));
}

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      shortDescription: products.shortDescription,
      description: products.description,
      details: products.detailsJson,
      priceAmount: products.priceAmount,
      compareAtAmount: products.compareAtAmount,
      taxIncluded: products.taxIncluded,
      stockQuantity: products.stockQuantity,
      trackInventory: products.trackInventory,
      allowPreorder: products.allowPreorder,
      seoTitle: products.seoTitle,
      seoDescription: products.seoDescription,
      imageUrl: mediaAssets.url,
      imageAlt: mediaAssets.altText,
      imageWidth: mediaAssets.width,
      imageHeight: mediaAssets.height,
      categoryName: categories.name,
      categorySlug: categories.slug,
      brandName: brands.name,
    })
    .from(products)
    .leftJoin(mediaAssets, eq(products.mainMediaId, mediaAssets.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(products.slug, slug), eq(products.status, "published")))
    .limit(1);

  const product = rows[0];
  if (!product) return null;

  const [media, variants] = await Promise.all([
    db
      .select({
        id: productMedia.id,
        role: productMedia.role,
        sortOrder: productMedia.sortOrder,
        url: mediaAssets.url,
        type: mediaAssets.type,
        altText: mediaAssets.altText,
        width: mediaAssets.width,
        height: mediaAssets.height,
      })
      .from(productMedia)
      .innerJoin(mediaAssets, eq(productMedia.mediaId, mediaAssets.id))
      .where(eq(productMedia.productId, product.id))
      .orderBy(asc(productMedia.sortOrder)),
    db
      .select({
        id: productVariants.id,
        name: productVariants.name,
        sku: productVariants.sku,
        priceAmount: productVariants.priceAmount,
        stockQuantity: productVariants.stockQuantity,
        status: productVariants.status,
        sortOrder: productVariants.sortOrder,
        attributeValue: attributeValues.value,
      })
      .from(productVariants)
      .leftJoin(variantAttributeValues, eq(variantAttributeValues.variantId, productVariants.id))
      .leftJoin(attributeValues, eq(attributeValues.id, variantAttributeValues.attributeValueId))
      .where(eq(productVariants.productId, product.id))
      .orderBy(asc(productVariants.sortOrder)),
  ]);

  return { ...product, media, variants };
}

export async function getCartCatalog() {
  return db
    .select({
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      variantId: productVariants.id,
      variantName: productVariants.name,
      priceAmount: productVariants.priceAmount,
      fallbackPriceAmount: products.priceAmount,
      stockQuantity: productVariants.stockQuantity,
      status: productVariants.status,
      allowPreorder: products.allowPreorder,
      imageUrl: mediaAssets.url,
      imageAlt: mediaAssets.altText,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .leftJoin(mediaAssets, eq(products.mainMediaId, mediaAssets.id))
    .where(eq(products.status, "published"));
}
