"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export type ShopFilters = { search: string; category: string; availability: "all" | "in_stock"; priced: boolean };

export function createShopHref(filters: ShopFilters) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.availability === "in_stock") params.set("availability", "in_stock");
  if (filters.priced) params.set("priced", "1");
  const query = params.toString();
  return query ? `/magaza?${query}` : "/magaza";
}

export function ShopDiscoveryBar({ categories, filters }: { categories: Array<{ slug: string; label: string }>; filters: ShopFilters }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(Boolean(filters.search));
  const [value, setValue] = useState(filters.search);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);
  function update(next: Partial<ShopFilters>) { router.push(createShopHref({ ...filters, ...next })); }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); update({ search: value }); }
  function closeSearch() { setValue(""); setSearchOpen(false); update({ search: "" }); }

  const tabs = [{ slug: "all", label: "Tümü" }, ...categories];
  return <div className="discovery-bar-wrap"><motion.div layout transition={reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.18, duration: 0.45 }} className="discovery-bar">
    {searchOpen ? <form onSubmit={submit} className="discovery-search"><Search size={18} /><input ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") closeSearch(); }} placeholder="Ürün ara" aria-label="Ürün ara" /><button type="button" onClick={closeSearch} aria-label="Aramayı kapat"><X size={17} /></button></form> : <><button type="button" className="discovery-search-button" onClick={() => setSearchOpen(true)} aria-label="Arama"><Search size={18} /></button><div className="discovery-tabs" role="tablist" aria-label="Katalog kategorileri">{tabs.map((tab) => <button type="button" key={tab.slug} role="tab" aria-selected={filters.category === tab.slug} onClick={() => update({ category: tab.slug })} className={filters.category === tab.slug ? "discovery-tab-active" : ""}>{tab.label}</button>)}</div></>}
    <div className="discovery-tags"><button type="button" aria-pressed={filters.availability === "in_stock"} onClick={() => update({ availability: filters.availability === "in_stock" ? "all" : "in_stock" })}><SlidersHorizontal size={15} /> Stokta</button><button type="button" aria-pressed={filters.priced} onClick={() => update({ priced: !filters.priced })}>Fiyatı net</button></div>
  </motion.div></div>;
}
