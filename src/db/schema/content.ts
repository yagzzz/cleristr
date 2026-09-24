import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { booleanColumn, idColumn, optionalPublishWindow, timestampColumns } from "./common";
import { mediaAssets } from "./catalog";

export const pages = sqliteTable(
  "pages",
  {
    id: idColumn(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    contentJson: text("content_json", { mode: "json" }).$type<Array<Record<string, unknown>>>().notNull(),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
    template: text("template").notNull().default("default"),
    publishedAt: text("published_at"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    noIndex: booleanColumn("no_index"),
    ogMediaId: text("og_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("pages_slug_unique").on(table.slug), index("pages_status_idx").on(table.status)],
);

export const menus = sqliteTable("menus", {
  id: idColumn(),
  name: text("name").notNull(),
  location: text("location", { enum: ["header", "footer", "mobile", "account"] }).notNull(),
  isActive: booleanColumn("is_active", true),
  ...timestampColumns(),
}, (table) => [uniqueIndex("menus_location_unique").on(table.location)]);

export const menuItems = sqliteTable(
  "menu_items",
  {
    id: idColumn(),
    menuId: text("menu_id").notNull().references(() => menus.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    label: text("label").notNull(),
    href: text("href").notNull(),
    target: text("target", { enum: ["self", "blank"] }).notNull().default("self"),
    isActive: booleanColumn("is_active", true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [index("menu_items_menu_idx").on(table.menuId, table.sortOrder), index("menu_items_parent_idx").on(table.parentId)],
);

export const banners = sqliteTable(
  "banners",
  {
    id: idColumn(),
    name: text("name").notNull(),
    placement: text("placement", { enum: ["hero", "hero_mobile", "campaign", "category", "inline_ad"] }).notNull(),
    title: text("title"),
    subtitle: text("subtitle"),
    ctaLabel: text("cta_label"),
    ctaHref: text("cta_href"),
    desktopMediaId: text("desktop_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    mobileMediaId: text("mobile_media_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    isActive: booleanColumn("is_active"),
    sortOrder: integer("sort_order").notNull().default(0),
    audienceJson: text("audience_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    ...optionalPublishWindow(),
    ...timestampColumns(),
  },
  (table) => [index("banners_placement_idx").on(table.placement, table.isActive, table.sortOrder)],
);

export const announcements = sqliteTable(
  "announcements",
  {
    id: idColumn(),
    type: text("type", { enum: ["top_bar", "site", "campaign", "maintenance"] }).notNull(),
    message: text("message").notNull(),
    href: text("href"),
    audience: text("audience", { enum: ["all", "mobile", "desktop"] }).notNull().default("all"),
    dismissible: booleanColumn("dismissible", true),
    isActive: booleanColumn("is_active"),
    ...optionalPublishWindow(),
    ...timestampColumns(),
  },
  (table) => [index("announcements_active_idx").on(table.type, table.isActive, table.startsAt, table.endsAt)],
);

export const homepageSections = sqliteTable(
  "homepage_sections",
  {
    id: idColumn(),
    type: text("type", {
      enum: [
        "hero",
        "campaigns",
        "featured_products",
        "new_products",
        "bestsellers",
        "sale_products",
        "collections",
        "categories",
        "editorial",
        "brand_story",
        "trust",
        "reviews",
        "newsletter",
        "social",
      ],
    }).notNull(),
    title: text("title"),
    subtitle: text("subtitle"),
    isActive: booleanColumn("is_active"),
    hideWhenEmpty: booleanColumn("hide_when_empty", true),
    sortOrder: integer("sort_order").notNull().default(0),
    configJson: text("config_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("homepage_section_type_unique").on(table.type), index("homepage_sections_order_idx").on(table.isActive, table.sortOrder)],
);

export const siteSettings = sqliteTable(
  "site_settings",
  {
    key: text("key").primaryKey(),
    valueJson: text("value_json", { mode: "json" }).$type<unknown>().notNull(),
    isPublic: booleanColumn("is_public"),
    updatedAt: text("updated_at").notNull(),
    updatedByUserId: text("updated_by_user_id"),
  },
  (table) => [index("site_settings_public_idx").on(table.isPublic)],
);

export const redirects = sqliteTable(
  "redirects",
  {
    id: idColumn(),
    sourcePath: text("source_path").notNull(),
    destination: text("destination").notNull(),
    statusCode: integer("status_code").notNull().default(301),
    isActive: booleanColumn("is_active", true),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("redirect_source_unique").on(table.sourcePath)],
);
