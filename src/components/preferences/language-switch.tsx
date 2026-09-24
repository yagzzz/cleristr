"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/locale";

export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function change(nextLocale: Locale) {
    if (nextLocale === locale || pending) return;
    setPending(true);
    await fetch("/api/preferences/locale", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ locale: nextLocale }) });
    router.refresh();
    setPending(false);
  }
  return <div className="language-switch" aria-label={label}>
    <button type="button" onClick={() => change("tr")} disabled={pending} aria-pressed={locale === "tr"}>TR</button>
    <button type="button" onClick={() => change("en")} disabled={pending} aria-pressed={locale === "en"}>EN</button>
  </div>;
}
