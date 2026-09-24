import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./data/cleris.db",
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});

const now = new Date().toISOString();
const rows: Array<{ sql: string; args: Array<string | number | null> }> = [
  {
    sql: `INSERT INTO media_assets
      (id, storage_key, url, type, mime_type, original_name, title, alt_text, width, height, size_bytes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET url=excluded.url, alt_text=excluded.alt_text, updated_at=excluded.updated_at`,
    args: ["media_baggy_main", "products/baggy-esofman.webp", "/media/products/baggy-esofman.webp", "image", "image/webp", "Baggy Eşofman Altı Unisex Oversize.webp", "Baggy Eşofman", "Siyah CLERIS baggy eşofman altı düz ürün görünümü", 375, 500, 18268, now, now],
  },
  {
    sql: `INSERT INTO media_assets
      (id, storage_key, url, type, mime_type, original_name, title, alt_text, width, height, size_bytes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET url=excluded.url, alt_text=excluded.alt_text, updated_at=excluded.updated_at`,
    args: ["media_reel_0221", "reels/0221-720.mp4", "/media/reels/0221-720.mp4", "video", "video/mp4", "0221.mp4", "CLERIS Baggy Reels 01", "Baggy eşofmanın şehir ve otopark çekimlerinden ürün videosu", 720, 1280, 4134219, now, now],
  },
  {
    sql: `INSERT INTO media_assets
      (id, storage_key, url, type, mime_type, original_name, title, alt_text, width, height, size_bytes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET url=excluded.url, alt_text=excluded.alt_text, updated_at=excluded.updated_at`,
    args: ["media_reel_0223", "reels/0223-720.mp4", "/media/reels/0223-720.mp4", "video", "video/mp4", "0223.mp4", "CLERIS Baggy Reels 02", "Baggy eşofmanın paça fermuarı ve logo detayını gösteren ürün videosu", 720, 1280, 5132836, now, now],
  },
  {
    sql: `INSERT INTO brands (id, name, slug, description, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET description=excluded.description, updated_at=excluded.updated_at`,
    args: ["brand_cleris", "CLERIS", "cleris", "CLERIS özgün giyim ve aksesuar ürünleri.", now, now],
  },
  {
    sql: `INSERT INTO categories (id, parent_id, name, slug, description, sort_order, is_active, created_at, updated_at)
      VALUES (?, NULL, ?, ?, ?, 0, 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, updated_at=excluded.updated_at`,
    args: ["category_giyim", "Giyim", "giyim", "CLERIS giyim koleksiyonu.", now, now],
  },
  {
    sql: `INSERT INTO categories (id, parent_id, name, slug, description, sort_order, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET parent_id=excluded.parent_id, name=excluded.name, updated_at=excluded.updated_at`,
    args: ["category_alt_giyim", "category_giyim", "Alt Giyim", "alt-giyim", "Eşofman ve alt giyim ürünleri.", now, now],
  },
  {
    sql: `INSERT INTO products
      (id, name, slug, sku, short_description, description, details_json, status, product_type, target_group, brand_id, category_id, price_amount, tax_rate_bps, tax_included, track_inventory, allow_preorder, stock_quantity, low_stock_threshold, main_media_id, published_at, seo_title, seo_description, is_featured, is_bestseller, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'published', 'physical', 'unisex', ?, ?, NULL, 2000, 1, 1, 0, 0, 5, ?, ?, ?, ?, 1, 0, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, short_description=excluded.short_description, description=excluded.description, details_json=excluded.details_json, main_media_id=excluded.main_media_id, seo_title=excluded.seo_title, seo_description=excluded.seo_description, updated_at=excluded.updated_at`,
    args: [
      "product_baggy_esofman",
      "Baggy Eşofman Altı Unisex Oversize",
      "baggy-esofman-alti-unisex-oversize",
      "CL-BAGGY-001",
      "Siyah, rahat baggy form; CLERIS logo ve paça fermuar detayı.",
      "CLERIS Baggy Eşofman, düz ürün çekimi ve lifestyle videolarında görülen siyah unisex formuyla sunulur. Kumaş içeriği, bakım talimatı, satış fiyatı ve stok bilgisi admin panelinden gerçek ürün verisiyle tamamlanmadan satın alma açılmaz.",
      JSON.stringify([
        { label: "Renk", value: "Siyah" },
        { label: "Kalıp", value: "Baggy / oversize" },
        { label: "Detay", value: "CLERIS logo" },
        { label: "Paça", value: "Fermuar ve büzgü detayı" },
      ]),
      "brand_cleris",
      "category_alt_giyim",
      "media_baggy_main",
      now,
      "Baggy Eşofman Altı Unisex Oversize",
      "CLERIS siyah unisex baggy eşofman altını ürün görselleri, beden seçenekleri ve detaylarıyla inceleyin.",
      now,
      now,
    ],
  },
  {
    sql: `INSERT INTO product_media (id, product_id, media_id, role, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`,
    args: ["product_media_baggy_1", "product_baggy_esofman", "media_baggy_main", "image", 0, now],
  },
  {
    sql: `INSERT INTO product_media (id, product_id, media_id, role, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`,
    args: ["product_media_baggy_2", "product_baggy_esofman", "media_reel_0221", "video", 1, now],
  },
  {
    sql: `INSERT INTO product_media (id, product_id, media_id, role, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`,
    args: ["product_media_baggy_3", "product_baggy_esofman", "media_reel_0223", "video", 2, now],
  },
  {
    sql: `INSERT INTO product_attributes (id, name, slug, input_type, sort_order, created_at, updated_at)
      VALUES ('attribute_size', 'Beden', 'beden', 'select', 0, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, updated_at=excluded.updated_at`,
    args: [now, now],
  },
];

for (const size of ["XS", "S", "M", "L", "XL"]) {
  const valueId = `attribute_size_${size.toLowerCase()}`;
  const variantId = `variant_baggy_${size.toLowerCase()}`;
  rows.push(
    {
      sql: `INSERT INTO attribute_values (id, attribute_id, value, slug, sort_order, created_at, updated_at)
        VALUES (?, 'attribute_size', ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`,
      args: [valueId, size, size.toLowerCase(), ["XS", "S", "M", "L", "XL"].indexOf(size), now, now],
    },
    {
      sql: `INSERT INTO product_variants
        (id, product_id, name, sku, price_amount, stock_quantity, low_stock_threshold, image_media_id, status, sort_order, created_at, updated_at)
        VALUES (?, 'product_baggy_esofman', ?, ?, NULL, 0, 2, 'media_baggy_main', 'out_of_stock', ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, image_media_id=excluded.image_media_id, updated_at=excluded.updated_at`,
      args: [variantId, size, `CL-BAGGY-001-${size}`, ["XS", "S", "M", "L", "XL"].indexOf(size), now, now],
    },
    {
      sql: `INSERT INTO variant_attribute_values (id, variant_id, attribute_value_id)
        VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING`,
      args: [`variant_attribute_baggy_${size.toLowerCase()}`, variantId, valueId],
    },
  );
}

const menuRows = [
  ["menu_header", "Ana menü", "header"],
  ["menu_footer", "Footer", "footer"],
  ["menu_mobile", "Mobil menü", "mobile"],
] as const;
for (const [id, name, location] of menuRows) {
  rows.push({
    sql: `INSERT INTO menus (id, name, location, is_active, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, updated_at=excluded.updated_at`,
    args: [id, name, location, now, now],
  });
}

const headerItems = [
  ["menu_item_home", "Ana Sayfa", "/", 0],
  ["menu_item_shop", "Mağaza", "/magaza", 1],
  ["menu_item_story", "Drop 001", "/urun/baggy-esofman-alti-unisex-oversize", 2],
  ["menu_item_contact", "Hesabım", "/hesabim", 3],
] as const;
for (const [id, label, href, sortOrder] of headerItems) {
  rows.push({
    sql: `INSERT INTO menu_items (id, menu_id, label, href, target, is_active, sort_order, created_at, updated_at)
      VALUES (?, 'menu_header', ?, ?, 'self', 1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET label=excluded.label, href=excluded.href, sort_order=excluded.sort_order, updated_at=excluded.updated_at`,
    args: [id, label, href, sortOrder, now, now],
  });
}

const sections: Array<[string, string, string, string, number, number, Record<string, unknown>]> = [
  ["home_hero", "hero", "Tek ürün. Net duruş.", "CLERIS Baggy ile ilk drop.", 1, 0, { ctaLabel: "Ürünü incele", ctaHref: "/urun/baggy-esofman-alti-unisex-oversize" }],
  ["home_featured", "featured_products", "Öne çıkan", "İlk CLERIS ürünü.", 1, 10, { productIds: ["product_baggy_esofman"] }],
  ["home_brand", "brand_story", "CLERIS sokakta doğar", "Ürünü hareket, şehir ve gerçek kullanım içinde anlatan bağımsız bir yaklaşım.", 1, 20, {}],
  ["home_trust", "trust", "Alışveriş bilgileri", "Ödeme, kargo ve iade bilgileri gerçek ayarlar tamamlandığında burada gösterilir.", 0, 30, {}],
  ["home_newsletter", "newsletter", "Drop'lardan haberdar ol", "Yalnızca izin veren kullanıcılara gönderim yapılır.", 1, 40, {}],
  ["home_social", "social", "CLERIS hareket halinde", "Ürün videoları ve kampanya çekimleri.", 1, 50, { mediaIds: ["media_reel_0221", "media_reel_0223"] }],
];
for (const [id, type, title, subtitle, active, sortOrder, config] of sections) {
  rows.push({
    sql: `INSERT INTO homepage_sections
      (id, type, title, subtitle, is_active, hide_when_empty, sort_order, config_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET title=excluded.title, subtitle=excluded.subtitle, config_json=excluded.config_json, updated_at=excluded.updated_at`,
    args: [id, type, title, subtitle, active, sortOrder, JSON.stringify(config), now, now],
  });
}

const settings: Array<[string, unknown, number]> = [
  ["store.general", { name: "CLERIS", domain: "https://cleristr.com", currency: "TRY", locale: "tr-TR" }, 1],
  ["store.checkout", { enabled: false, disabledReason: "Gerçek fiyat, stok, kargo ve PAYTR bilgileri tamamlanmalıdır." }, 1],
  ["store.shipping", { freeShippingThreshold: null }, 1],
  ["seo.global", { title: "CLERIS", description: "CLERIS giyim ve aksesuar mağazası.", defaultOgImage: "/media/brand/cleris-black.webp" }, 1],
  ["tracking.integrations", { ga4: "", gtm: "", googleAds: "", metaPixel: "", tiktokPixel: "" }, 0],
];
for (const [key, value, isPublic] of settings) {
  rows.push({
    sql: `INSERT INTO site_settings (key, value_json, is_public, updated_at)
      VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json, is_public=excluded.is_public, updated_at=excluded.updated_at`,
    args: [key, JSON.stringify(value), isPublic, now],
  });
}

for (const row of rows) await client.execute(row);

console.log(`Seeded ${rows.length} records without fake products, prices, stock, reviews, or orders.`);
client.close();
