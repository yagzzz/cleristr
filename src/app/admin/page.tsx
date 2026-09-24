import type { Metadata } from "next";
import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Megaphone, PackagePlus, Settings2, Truck } from "lucide-react";
import { createShippingMethodAction, saveTopAnnouncementAction, updateProductAction, updateVariantAction } from "./actions";
import { db } from "@/db/client";
import { announcements, orders, products, productVariants, shippingMethods } from "@/db/schema";
import { can, type UserRole } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";

export const metadata: Metadata = { title: "Yönetim", robots: { index: false, follow: false } };

function money(amount: number | null) {
  return amount === null ? "Tanımlanmadı" : new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount / 100);
}
function moneyInput(amount: number | null) {
  return amount === null ? "" : new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount / 100);
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/hesabim/giris?next=/admin");
  if (!can(user.role as UserRole, "admin.access")) redirect("/");

  const [catalog, methods, recentOrders, topAnnouncements] = await Promise.all([
    db.select().from(products).orderBy(asc(products.createdAt)),
    db.select().from(shippingMethods).orderBy(asc(shippingMethods.sortOrder)),
    db.select({ id: orders.id }).from(orders).orderBy(desc(orders.createdAt)).limit(5),
    db.select().from(announcements).where(eq(announcements.type, "top_bar")).orderBy(desc(announcements.updatedAt)).limit(1),
  ]);
  const variants = catalog.length ? await db.select().from(productVariants).where(eq(productVariants.productId, catalog[0].id)).orderBy(asc(productVariants.sortOrder)) : [];
  const product = catalog[0];
  const variantsStock = variants.reduce((sum, item) => sum + item.stockQuantity, 0);
  const topAnnouncement = topAnnouncements[0];

  return (
    <main className="site-container py-8 sm:py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-black/15 pb-6"><div><p className="eyebrow">CLERIS YÖNETİM</p><h1 className="mt-2 text-4xl font-black tracking-tight">Operasyon paneli</h1><p className="mt-2 text-sm text-muted">Rol: {user.role}. Tüm fiyatlar sunucuda kuruş olarak saklanır; aşağıdaki alanlara normal TL fiyatı yazılır.</p></div><Link href="/" className="secondary-button">Mağazayı aç</Link></header>
      <div className="mb-10 grid gap-px bg-black/15 sm:grid-cols-3"><Stat label="Ürün" value={String(catalog.length)} /><Stat label="Varyasyon" value={String(variants.length)} /><Stat label="Son sipariş" value={String(recentOrders.length)} /></div>

      {product ? <section className="mb-10 border border-black/15 bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><Settings2 aria-hidden="true" /><div><h2 className="text-2xl font-black">Ürün yayını ve temel fiyat</h2><p className="text-sm text-muted">Gerçek ürün bilgisi girilmeden mağazada satış başlatılmaz.</p></div></div>
        <form action={updateProductAction} className="mt-6 grid gap-4 md:grid-cols-2"><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="stockQuantity" value={variantsStock} /><AdminField label="Ürün adı" name="name" defaultValue={product.name} /><AdminField label="Temel fiyat (TL)" name="priceAmount" defaultValue={moneyInput(product.priceAmount)} placeholder="Örn. 1.199,00" /><label className="text-sm font-semibold">Yayın durumu<select name="status" defaultValue={product.status} className="admin-input"><option value="draft">Taslak</option><option value="published">Yayında</option><option value="archived">Arşiv</option></select></label><div className="flex flex-wrap items-end gap-5"><label className="flex items-center gap-2 text-sm"><input name="trackInventory" type="checkbox" defaultChecked={product.trackInventory} /> Stok takip et</label><label className="flex items-center gap-2 text-sm"><input name="allowPreorder" type="checkbox" defaultChecked={product.allowPreorder} /> Ön siparişe izin ver</label></div><div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-5"><p className="text-sm text-muted">Mevcut varyasyon toplam stoğu: <strong>{variantsStock}</strong></p><button className="primary-button" type="submit">Ürünü kaydet</button></div></form>
      </section> : <section className="mb-10 border border-black/15 bg-white p-7"><h2 className="text-2xl font-black">Ürün yok</h2><p className="mt-2 text-muted">İlk gerçek ürün, bu panelde ürün oluşturma adımı eklendiğinde eklenebilir.</p></section>}

      {product ? <section className="mb-10 border border-black/15 bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><PackagePlus aria-hidden="true" /><div><h2 className="text-2xl font-black">Beden ve stok</h2><p className="text-sm text-muted">Boş varyasyon fiyatı, yukarıdaki temel fiyatı kullanır.</p></div></div><div className="mt-6 grid gap-4">{variants.map((variant) => <form key={variant.id} action={updateVariantAction} className="grid gap-4 border border-black/15 p-4 md:grid-cols-[1fr_10rem_8rem_10rem_auto]"><input type="hidden" name="variantId" value={variant.id} /><div><p className="font-bold">{variant.name}</p><p className="text-xs text-muted">{variant.sku}</p></div><AdminField label="Fiyat (TL)" name="priceAmount" defaultValue={moneyInput(variant.priceAmount)} placeholder="Temel fiyat" /><AdminField label="Stok" name="stockQuantity" defaultValue={String(variant.stockQuantity)} inputMode="numeric" /><label className="text-sm font-semibold">Durum<select name="status" defaultValue={variant.status} className="admin-input"><option value="active">Satışta</option><option value="out_of_stock">Tükendi</option><option value="disabled">Pasif</option></select></label><button className="secondary-button self-end" type="submit">Kaydet</button></form>)}</div></section> : null}

      <section className="mb-10 border border-black/15 bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><Megaphone aria-hidden="true" /><div><h2 className="text-2xl font-black">Üst duyuru</h2><p className="text-sm text-muted">Kapatılabilir CLERIS kampanya şeridi. Mesaj, bağlantı ve yayın durumu gerçek zamanlı güncellenir.</p></div></div><form action={saveTopAnnouncementAction} className="mt-6 grid gap-4 sm:grid-cols-2"><input type="hidden" name="announcementId" value={topAnnouncement?.id || ""} /><AdminField label="Duyuru metni" name="message" defaultValue={topAnnouncement?.message || ""} placeholder="Örn. Yeni drop için bildirimleri aç" /><AdminField label="Bağlantı (opsiyonel)" name="href" defaultValue={topAnnouncement?.href || ""} placeholder="/magaza veya https://..." required={false} /><label className="flex items-center gap-2 text-sm"><input name="isActive" type="checkbox" defaultChecked={topAnnouncement?.isActive ?? false} /> Duyuruyu göster</label><label className="flex items-center gap-2 text-sm"><input name="dismissible" type="checkbox" defaultChecked={topAnnouncement?.dismissible ?? true} /> Kullanıcı kapatabilsin</label><div className="sm:col-span-2 flex justify-end"><button type="submit" className="primary-button">Duyuruyu kaydet</button></div></form></section>

      <section className="border border-black/15 bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><Truck aria-hidden="true" /><div><h2 className="text-2xl font-black">Kargo yöntemleri</h2><p className="text-sm text-muted">Checkout yalnızca aktif bir kargo yöntemi olduğunda başlar.</p></div></div><div className="mt-6 grid gap-3">{methods.length ? methods.map((method) => <div key={method.id} className="flex flex-wrap justify-between gap-3 border border-black/15 p-4 text-sm"><div><strong>{method.name}</strong><p className="text-muted">{method.code} · {method.estimatedMinDays || "?"}-{method.estimatedMaxDays || "?"} iş günü</p></div><p className="font-semibold">{money(method.basePriceAmount)}</p></div>) : <p className="text-sm text-muted">Henüz yayımlanmış kargo yöntemi yok.</p>}</div><form action={createShippingMethodAction} className="mt-6 grid gap-4 border-t border-black/15 pt-6 sm:grid-cols-2 lg:grid-cols-4"><AdminField label="Kargo adı" name="name" placeholder="Örn. Standart teslimat" /><AdminField label="Kod" name="code" placeholder="standard" /><AdminField label="Ücret (TL)" name="basePriceAmount" placeholder="Örn. 79,90" /><AdminField label="Ücretsiz kargo eşiği (TL)" name="freeThresholdAmount" required={false} placeholder="Opsiyonel" /><AdminField label="En erken gün" name="estimatedMinDays" inputMode="numeric" defaultValue="2" /><AdminField label="En geç gün" name="estimatedMaxDays" inputMode="numeric" defaultValue="5" /><label className="sm:col-span-2 text-sm font-semibold">Açıklama<input name="description" className="admin-input" placeholder="Teslimat hakkında kısa açıklama" /></label><div className="sm:col-span-2 lg:col-span-4 flex justify-end"><button className="primary-button" type="submit">Kargo yöntemi ekle</button></div></form></section>
    </main>
  );
}

function AdminField({ label, name, defaultValue, placeholder, required = true, inputMode }: { label: string; name: string; defaultValue?: string; placeholder?: string; required?: boolean; inputMode?: "numeric" | "decimal" }) {
  return <label className="text-sm font-semibold">{label}<input name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} inputMode={inputMode} className="admin-input" /></label>;
}
function Stat({ label, value }: { label: string; value: string }) { return <div className="bg-white p-5"><p className="eyebrow">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }
