"use client";

import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { InterfaceCopy } from "@/i18n/locale";
import { normalizeCookiePreferences, type CookiePreferences } from "./cookie-preferences";

const STORAGE_KEY = "cleris_cookie_preferences_v1";

export function CookieConsent({ copy }: { copy: Pick<InterfaceCopy, "cookieTitle" | "cookieBody" | "acceptAll" | "rejectOptional" | "manage" | "savePreferences" | "cookieEssential" | "cookieEssentialDescription" | "cookieAnalytics" | "cookieAnalyticsDescription" | "cookieMarketing" | "cookieMarketingDescription"> }) {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({ essential: true, analytics: false, marketing: false });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (!saved) setVisible(true);
        else setPreferences(normalizeCookiePreferences(JSON.parse(saved)));
      } catch { setVisible(true); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function save(next: CookiePreferences) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("cleris:cookie-preferences", { detail: next }));
    setPreferences(next);
    setVisible(false);
  }

  if (!visible) return null;
  return <aside className="cookie-consent" aria-label={copy.cookieTitle}>
    <div className="flex items-start justify-between gap-4"><div><p className="font-bold">{copy.cookieTitle}</p><p className="mt-1 max-w-xl text-sm leading-6 text-muted">{copy.cookieBody}</p></div><button type="button" className="icon-button -mr-2 -mt-2" onClick={() => setSettings((value) => !value)} aria-label={copy.manage}><Settings2 size={18} /></button></div>
    {settings ? <div className="mt-4 grid gap-3 border-y border-black/10 py-4 text-sm"><label className="flex items-start justify-between gap-4"><span><strong>{copy.cookieEssential}</strong><span className="block text-muted">{copy.cookieEssentialDescription}</span></span><input type="checkbox" checked disabled /></label><label className="flex items-start justify-between gap-4"><span><strong>{copy.cookieAnalytics}</strong><span className="block text-muted">{copy.cookieAnalyticsDescription}</span></span><input type="checkbox" checked={preferences.analytics} onChange={(event) => setPreferences((current) => ({ ...current, analytics: event.target.checked }))} /></label><label className="flex items-start justify-between gap-4"><span><strong>{copy.cookieMarketing}</strong><span className="block text-muted">{copy.cookieMarketingDescription}</span></span><input type="checkbox" checked={preferences.marketing} onChange={(event) => setPreferences((current) => ({ ...current, marketing: event.target.checked }))} /></label></div> : null}
    <div className="mt-5 flex flex-wrap gap-2"><button type="button" className="primary-button" onClick={() => save({ essential: true, analytics: true, marketing: true })}>{copy.acceptAll}</button><button type="button" className="secondary-button" onClick={() => save({ essential: true, analytics: false, marketing: false })}>{copy.rejectOptional}</button>{settings ? <button type="button" className="secondary-button" onClick={() => save(preferences)}>{copy.savePreferences}</button> : null}</div>
  </aside>;
}
