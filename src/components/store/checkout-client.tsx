"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, ChevronLeft, LockKeyhole } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { formatTry } from "./product-card";
import { useStore } from "./store-provider";

type CatalogItem = {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantName: string;
  priceAmount: number | null;
  fallbackPriceAmount: number | null;
  stockQuantity: number;
  status: "active" | "disabled" | "out_of_stock";
  allowPreorder: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
};

type ShippingMethod = { id: string; name: string; description: string | null; basePriceAmount: number; freeThresholdAmount: number | null; estimatedMinDays: number | null; estimatedMaxDays: number | null };

type PaymentState = { iframeToken: string; orderNumber: string; testMode: boolean };

export function CheckoutClient({ catalog, shippingMethods }: { catalog: CatalogItem[]; shippingMethods: ShippingMethod[] }) {
  const { cartItems } = useStore();
  const [message, setMessage] = useState("");
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sameAddress, setSameAddress] = useState(true);
  const checkoutKey = useRef(`checkout_${crypto.randomUUID().replace(/-/g, "")}`);
  const entries = useMemo(
    () => cartItems.map((item) => ({ item, catalog: catalog.find((entry) => entry.variantId === item.variantId) })).filter((entry): entry is { item: typeof cartItems[number]; catalog: CatalogItem } => Boolean(entry.catalog)),
    [cartItems, catalog],
  );
  const subtotal = entries.reduce((total, entry) => total + (entry.catalog.priceAmount ?? entry.catalog.fallbackPriceAmount ?? 0) * entry.item.quantity, 0);
  const canStart = entries.length > 0 && shippingMethods.length > 0 && entries.every((entry) => {
    const price = entry.catalog.priceAmount ?? entry.catalog.fallbackPriceAmount;
    return price !== null && price > 0 && entry.catalog.status === "active" && (entry.catalog.stockQuantity >= entry.item.quantity || entry.catalog.allowPreorder);
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!canStart) return;
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) || "");
    const sameAddress = form.get("sameAddress") === "on";
    const shippingAddress = {
      line1: field("shippingLine1"), line2: field("shippingLine2"), district: field("shippingDistrict"), city: field("shippingCity"), postalCode: field("shippingPostalCode"), countryCode: "TR",
    };
    const billingAddress = sameAddress ? shippingAddress : {
      line1: field("billingLine1"), line2: field("billingLine2"), district: field("billingDistrict"), city: field("billingCity"), postalCode: field("billingPostalCode"), countryCode: "TR",
    };
    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: entries.map(({ item }) => item),
          customer: { email: field("email"), firstName: field("firstName"), lastName: field("lastName"), phone: field("phone") },
          shippingAddress,
          billingAddress,
          shippingMethodId: field("shippingMethodId"),
          couponCode: field("couponCode") || undefined,
          customerNote: field("customerNote") || undefined,
          termsAccepted: form.get("termsAccepted") === "on",
          checkoutKey: checkoutKey.current,
        }),
      });
      const result = (await response.json()) as PaymentState & { message?: string };
      if (!response.ok || !result.iframeToken) throw new Error(result.message || "Ödeme başlatılamadı.");
      setPayment(result);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ödeme başlatılamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  if (entries.length === 0) {
    return <section className="site-container grid min-h-[55svh] place-items-center py-12 text-center"><div><h1 className="text-4xl font-black">Checkout için sepetin boş.</h1><Link href="/magaza" className="primary-button mt-6">Mağazaya dön</Link></div></section>;
  }

  if (payment) {
    return (
      <section className="site-container py-8 sm:py-12">
        <div className="mb-8 flex items-center gap-3 border border-black/15 bg-white p-4 text-sm"><CheckCircle2 aria-hidden="true" /><p><strong>Sipariş {payment.orderNumber}</strong> ödeme adımına hazırlandı. Sipariş yalnızca PAYTR bildirimi başarıyla doğrulandıktan sonra onaylanır.</p></div>
        {payment.testMode ? <p className="mb-4 text-sm text-muted">PAYTR test modu açık.</p> : null}
        <Script src="https://www.paytr.com/js/iframeResizer.min.js?v2" strategy="afterInteractive" onLoad={() => { window.iFrameResize?.({}, "#paytriframe"); }} />
        <iframe title="PAYTR güvenli ödeme" src={`https://www.paytr.com/odeme/guvenli/${payment.iframeToken}`} id="paytriframe" className="min-h-[650px] w-full border-0 bg-white" scrolling="no" />
      </section>
    );
  }

  return (
    <section className="site-container py-8 sm:py-12">
      <Link href="/sepet" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold"><ChevronLeft size={16} /> Sepete dön</Link>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form id="checkout-form" onSubmit={submit} className="space-y-8">
          <div className="border border-black/15 bg-white p-5 sm:p-7"><h1 className="text-3xl font-black tracking-tight">Teslimat bilgileri</h1><p className="mt-2 text-sm text-muted">Kart bilgileri CLERIS&apos;e değil, PAYTR&apos;ın güvenli ödeme formuna girilir.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Ad" name="firstName" autoComplete="given-name" /><Field label="Soyad" name="lastName" autoComplete="family-name" />
              <Field label="E-posta" name="email" type="email" autoComplete="email" /><Field label="Telefon" name="phone" type="tel" autoComplete="tel" />
              <Field label="Adres" name="shippingLine1" className="sm:col-span-2" autoComplete="address-line1" />
              <Field label="Adres devamı (opsiyonel)" name="shippingLine2" className="sm:col-span-2" autoComplete="address-line2" required={false} />
              <Field label="İlçe" name="shippingDistrict" autoComplete="address-level2" /><Field label="İl" name="shippingCity" autoComplete="address-level1" />
              <Field label="Posta kodu (opsiyonel)" name="shippingPostalCode" autoComplete="postal-code" required={false} />
            </div>
          </div>

          <div className="border border-black/15 bg-white p-5 sm:p-7"><h2 className="text-2xl font-black">Kargo yöntemi</h2>
            {shippingMethods.length ? <div className="mt-5 space-y-3">{shippingMethods.map((method) => <label key={method.id} className="flex cursor-pointer gap-3 border border-black/15 p-4 has-checked:border-ink"><input name="shippingMethodId" type="radio" value={method.id} defaultChecked={shippingMethods.length === 1} required /><span><strong>{method.name}</strong><span className="block text-sm text-muted">{method.description || "Teslimat seçeneği"}{method.estimatedMinDays ? ` · ${method.estimatedMinDays}-${method.estimatedMaxDays || method.estimatedMinDays} iş günü` : ""}</span></span><span className="ml-auto font-semibold">{method.basePriceAmount ? formatTry(method.basePriceAmount) : "Ücretsiz"}</span></label>)}</div> : <p className="mt-4 text-sm text-danger">Henüz yayımlanmış bir kargo yöntemi yok. Checkout başlatılamaz.</p>}
          </div>

          <div className="border border-black/15 bg-white p-5 sm:p-7"><h2 className="text-2xl font-black">Fatura bilgileri</h2><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" name="sameAddress" checked={sameAddress} onChange={(event) => setSameAddress(event.target.checked)} /> Teslimat adresim fatura adresimle aynı</label>
            {!sameAddress ? <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Fatura adresi" name="billingLine1" className="sm:col-span-2" /><Field label="Fatura adresi devamı" name="billingLine2" className="sm:col-span-2" required={false} /><Field label="Fatura ilçesi" name="billingDistrict" /><Field label="Fatura ili" name="billingCity" /><Field label="Fatura posta kodu" name="billingPostalCode" required={false} /></div> : null}
          </div>

          <div className="border border-black/15 bg-white p-5 sm:p-7"><label htmlFor="customerNote" className="font-bold">Sipariş notu <span className="font-normal text-muted">(opsiyonel)</span></label><textarea id="customerNote" name="customerNote" rows={3} maxLength={1000} className="mt-3 w-full border border-black/20 bg-canvas p-3 outline-none focus:border-ink" />
            <label className="mt-5 flex gap-3 text-sm leading-6"><input name="termsAccepted" type="checkbox" required className="mt-1" /><span>Mesafeli satış sözleşmesini ve ön bilgilendirme formunu okudum, kabul ediyorum.</span></label>
            <p className="mt-3 text-xs text-muted">Ödeme işlemi PAYTR aracılığıyla gerçekleştirilir. Sipariş onayı, sadece doğrulanmış ödeme bildirimi sonrasında verilir.</p>
          </div>
          <p role="status" aria-live="polite" className={message ? "text-sm text-danger" : "sr-only"}>{message}</p>
          <button type="submit" disabled={!canStart || submitting} className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-40"><LockKeyhole size={17} /> {submitting ? "Güvenli ödeme hazırlanıyor" : "PAYTR ile güvenli ödemeye geç"}</button>
          {!canStart ? <p className="text-center text-xs text-muted">Ödeme için gerçek fiyat, stok ve en az bir kargo yöntemi tanımlanmalıdır.</p> : null}
        </form>

        <aside className="h-fit border border-black/15 bg-white p-5 sm:p-6"><h2 className="text-xl font-black">Sipariş özeti</h2><div className="mt-5 space-y-4">{entries.map(({ item, catalog: product }) => { const price = product.priceAmount ?? product.fallbackPriceAmount; return <div key={item.variantId} className="grid grid-cols-[3.5rem_1fr_auto] gap-3 text-sm">{product.imageUrl ? <div className="relative aspect-[3/4] overflow-hidden bg-stone"><Image src={product.imageUrl} alt="" fill sizes="56px" className="object-cover" /></div> : null}<div><p className="font-semibold">{product.productName}</p><p className="text-muted">{product.variantName} × {item.quantity}</p></div><p className="font-semibold">{price ? formatTry(price * item.quantity) : "—"}</p></div>; })}</div><label className="mt-6 block text-sm font-semibold" htmlFor="couponCode">Kupon kodu<input id="couponCode" name="couponCode" form="checkout-form" className="mt-2 h-11 w-full border border-black/20 bg-canvas px-3 font-normal outline-none focus:border-ink" /></label><dl className="mt-6 space-y-3 border-t border-black/15 pt-5 text-sm"><div className="flex justify-between"><dt>Ara toplam</dt><dd>{subtotal ? formatTry(subtotal) : "—"}</dd></div><div className="flex justify-between text-muted"><dt>Kargo ve indirim</dt><dd>Ödeme öncesi hesaplanır</dd></div><div className="flex justify-between text-base font-black"><dt>Toplam</dt><dd>Sunucuda hesaplanır</dd></div></dl></aside>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", className = "", autoComplete, required = true }: { label: string; name: string; type?: string; className?: string; autoComplete?: string; required?: boolean }) {
  return <label className={`block text-sm font-semibold ${className}`}>{label}<input name={name} type={type} required={required} autoComplete={autoComplete} className="mt-2 h-11 w-full border border-black/20 bg-canvas px-3 font-normal outline-none focus:border-ink" /></label>;
}

declare global { interface Window { iFrameResize?: (options?: object, target?: string) => void } }
