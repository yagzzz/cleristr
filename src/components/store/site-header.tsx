"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { copy, type Locale } from "@/i18n/locale";
import { LanguageSwitch } from "@/components/preferences/language-switch";
import { ThemeSwitch } from "@/components/preferences/theme-switch";
import { useStore } from "./store-provider";

type MenuItem = { id: string; label: string; href: string; target: "self" | "blank" };

function CountBadge({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-acid px-1 text-[10px] font-bold text-ink">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function SiteHeader({ menu, locale }: { menu: MenuItem[]; locale: Locale }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount, wishlistCount } = useStore();
  const t = copy[locale];

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-canvas/95 backdrop-blur-md">
      <div className="site-container flex h-18 items-center justify-between gap-4">
        <button
          type="button"
          className="icon-button lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <Link href="/" className="relative block h-9 w-36 shrink-0" aria-label="CLERIS ana sayfa">
          <Image src="/media/brand/cleris-black.webp" alt="CLERIS" fill sizes="144px" className="object-contain" priority />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Ana menü">
          {menu.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              target={item.target === "blank" ? "_blank" : undefined}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-2 xl:flex"><LanguageSwitch locale={locale} label={t.language} /><ThemeSwitch label={t.theme} copy={t} /></div>
          <Link href="/arama" className="icon-button" aria-label={locale === "en" ? "Search" : "Ara"}>
            <Search aria-hidden="true" />
          </Link>
          <Link href="/hesabim" className="icon-button hidden sm:grid" aria-label={locale === "en" ? "Account" : "Hesabım"}>
            <UserRound aria-hidden="true" />
          </Link>
          <Link href="/favoriler" className="icon-button relative" aria-label={`${locale === "en" ? "Wishlist" : "Favoriler"}, ${wishlistCount} ${locale === "en" ? "items" : "ürün"}`}>
            <Heart aria-hidden="true" />
            <CountBadge count={wishlistCount} />
          </Link>
          <Link href="/sepet" className="icon-button relative" aria-label={`${locale === "en" ? "Cart" : "Sepet"}, ${cartCount} ${locale === "en" ? "items" : "ürün"}`}>
            <ShoppingBag aria-hidden="true" />
            <CountBadge count={cartCount} />
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-navigation" className="border-t border-black/10 bg-canvas px-5 py-5 lg:hidden" aria-label="Mobil menü">
          <div className="mb-4 flex items-center justify-between"><LanguageSwitch locale={locale} label={t.language} /><ThemeSwitch label={t.theme} copy={t} /></div>
          <div className="flex flex-col">
            {menu.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => setMobileOpen(false)} className="border-b border-black/10 py-4 text-lg font-semibold">
                {item.label}
              </Link>
            ))}
            <Link href="/hesabim" onClick={() => setMobileOpen(false)} className="py-4 text-lg font-semibold">
              Hesabım
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
