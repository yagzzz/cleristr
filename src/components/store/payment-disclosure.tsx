"use client";

import { Check, ChevronDown, CreditCard, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { formatTry } from "./product-card";

export function canOpenPaytrDisclosure(input: { selected: boolean; available: boolean; priceAmount: number | null }) {
  return input.selected && input.available && input.priceAmount !== null && input.priceAmount > 0;
}

export function PaymentDisclosure({ selected, available, priceAmount, onCheckout }: { selected: boolean; available: boolean; priceAmount: number | null; onCheckout: () => void }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const ready = canOpenPaytrDisclosure({ selected, available, priceAmount });
  return <div className="payment-disclosure"><button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="payment-disclosure-trigger"><span className="flex items-center gap-2"><CreditCard size={17} /> Ödeme nasıl işler?</span><ChevronDown size={16} className={open ? "rotate-180" : ""} /></button><AnimatePresence initial={false}>{open ? <motion.div initial={reduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reduceMotion ? undefined : { opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden"><div className="payment-disclosure-body"><div className="flex items-start gap-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-success" /><p className="text-sm leading-6">Kart bilgileri CLERIS&apos;e girilmez; işlem, checkout sonrası PAYTR&apos;ın güvenli iframe formunda tamamlanır.</p></div><dl className="mt-4 space-y-2 border-y border-black/10 py-4 text-sm"><div className="flex justify-between"><dt>Ürün toplamı</dt><dd>{priceAmount ? formatTry(priceAmount) : "Fiyat bekliyor"}</dd></div><div className="flex justify-between text-muted"><dt>Kargo</dt><dd>Checkout&apos;ta hesaplanır</dd></div></dl><ul className="mt-4 grid gap-2 text-sm text-muted"><li className="flex gap-2"><Check size={15} className="mt-0.5 text-success" /> Sipariş, PAYTR callback doğrulamasından sonra onaylanır.</li><li className="flex gap-2"><Check size={15} className="mt-0.5 text-success" /> İptal/iade süreci sipariş kaydına bağlı yürütülür.</li></ul><button type="button" disabled={!ready} onClick={onCheckout} className="primary-button mt-5 w-full">Sepete ekle ve güvenli ödemeye geç</button>{!ready ? <p className="mt-3 text-xs text-muted">Devam etmek için gerçek fiyatı olan, stokta bulunan bir beden seçin.</p> : null}</div></motion.div> : null}</AnimatePresence></div>;
}
