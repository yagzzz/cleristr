import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { booleanColumn, idColumn, optionalPublishWindow, timestampColumns } from "./common";

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: idColumn(),
    storageKey: text("storage_key").notNull(),
    url: text("url").notNull(),
    type: text("type", { enum: ["image", "video", "document"] }).notNull(),
    mimeType: text("mime_type").notNull(),
    originalName: text("original_name").notNull(),
    title: text("title"),
    altText: text("alt_text"),
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes").notNull(),
    metadataJson: text("metadata_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("media_storage_key_unique").on(table.storageKey), index("media_type_idx").on(table.type)],
);

export const brands = sqliteTable(
  "brands",
  {
    id: idColumn(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    logoMediaId: text("logo_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    isActive: booleanColumn("is_active", true),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("brands_slug_unique").on(table.slug)],
);

export const categories = sqliteTable(
  "categories",
  {
    id: idColumn(),
    parentId: text("parent_id"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageMediaId: text("image_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    bannerMediaId: text("banner_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: booleanColumn("is_active", true),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    noIndex: booleanColumn("no_index"),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("categories_slug_unique").on(table.slug), index("categories_parent_idx").on(table.parentId)],
);

export const collections = sqliteTable(
  "collections",
  {
    id: idColumn(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    imageMediaId: text("image_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    isActive: booleanColumn("is_active", true),
    ...optionalPublishWindow(),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("collections_slug_unique").on(table.slug)],
);

export const products = sqliteTable(
  "products",
  {
    id: idColumn(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sku: text("sku").notNull(),
    barcode: text("barcode"),
    shortDescription: text("short_description"),
    description: text("description"),
    detailsJson: text("details_json", { mode: "json" }).$type<Array<{ label: string; value: string }> | null>(),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    productType: text("product_type").notNull().default("physical"),
    targetGroup: text("target_group"),
    brandId: text("brand_id").references(() => brands.id, { onDelete: "set null" }),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    collectionId: text("collection_id").references(() => collections.id, { onDelete: "set null" }),
    priceAmount: integer("price_amount"),
    compareAtAmount: integer("compare_at_amount"),
    saleStartsAt: text("sale_starts_at"),
    saleEndsAt: text("sale_ends_at"),
    taxRateBps: integer("tax_rate_bps").notNull().default(2000),
    taxIncluded: booleanColumn("tax_included", true),
    trackInventory: booleanColumn("track_inventory", true),
    allowPreorder: booleanColumn("allow_preorder"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    weightGrams: integer("weight_grams"),
    shippingJson: text("shipping_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    mainMediaId: text("main_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    publishedAt: text("published_at"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    noIndex: booleanColumn("no_index"),
    ogMediaId: text("og_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    isFeatured: booleanColumn("is_featured"),
    isBestseller: booleanColumn("is_bestseller"),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    uniqueIndex("products_sku_unique").on(table.sku),
    uniqueIndex("products_barcode_unique").on(table.barcode),
    index("products_status_idx").on(table.status),
    index("products_category_idx").on(table.categoryId),
  ],
);

export const productMedia = sqliteTable(
  "product_media",
  {
    id: idColumn(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    mediaId: text("media_id").notNull().references(() => mediaAssets.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["image", "video", "size_guide"] }).notNull().default("image"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("product_media_unique").on(table.productId, table.mediaId), index("product_media_product_idx").on(table.productId)],
);

export const productAttributes = sqliteTable(
  "product_attributes",
  {
    id: idColumn(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    inputType: text("input_type", { enum: ["select", "swatch", "text"] }).notNull().default("select"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("attributes_slug_unique").on(table.slug)],
);

export const attributeValues = sqliteTable(
  "attribute_values",
  {
    id: idColumn(),
    attributeId: text("attribute_id").notNull().references(() => productAttributes.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    slug: text("slug").notNull(),
    colorHex: text("color_hex"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("attribute_value_unique").on(table.attributeId, table.slug)],
);

export const productVariants = sqliteTable(
  "product_variants",
  {
    id: idColumn(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku").notNull(),
    barcode: text("barcode"),
    priceAmount: integer("price_amount"),
    compareAtAmount: integer("compare_at_amount"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    imageMediaId: text("image_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    status: text("status", { enum: ["active", "disabled", "out_of_stock"] }).notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("variants_sku_unique").on(table.sku), uniqueIndex("variants_barcode_unique").on(table.barcode), index("variants_product_idx").on(table.productId)],
);

export const variantAttributeValues = sqliteTable(
  "variant_attribute_values",
  {
    id: idColumn(),
    variantId: text("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    attributeValueId: text("attribute_value_id").notNull().references(() => attributeValues.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("variant_attribute_value_unique").on(table.variantId, table.attributeValueId)],
);

export const inventoryMovements = sqliteTable(
  "inventory_movements",
  {
    id: idColumn(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["initial", "adjustment", "reserve", "release", "sale", "return"] }).notNull(),
    quantityDelta: integer("quantity_delta").notNull(),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    note: text("note"),
    actorUserId: text("actor_user_id"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("inventory_variant_idx").on(table.variantId), index("inventory_reference_idx").on(table.referenceType, table.referenceId)],
);

export const tags = sqliteTable("tags", {
  id: idColumn(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  ...timestampColumns(),
}, (table) => [uniqueIndex("tags_slug_unique").on(table.slug)]);

export const productTags = sqliteTable("product_tags", {
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [uniqueIndex("product_tag_unique").on(table.productId, table.tagId)]);
