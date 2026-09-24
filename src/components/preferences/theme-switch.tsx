"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { InterfaceCopy } from "@/i18n/locale";
import { resolveTheme, type ThemePreference } from "./theme";

const STORAGE_KEY = "cleris_theme";

function readPreference(): ThemePreference {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

export function ThemeSwitch({ label, copy }: { label: string; copy: Pick<InterfaceCopy, "themeLight" | "themeDark" | "themeSystem"> }) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const value = readPreference();
      setPreference(value);
      const resolved = resolveTheme(value, window.matchMedia("(prefers-color-scheme: dark)").matches);
      setResolvedTheme(resolved);
      document.documentElement.dataset.theme = resolved;
    };
    sync();
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  function choose(value: ThemePreference) {
    window.localStorage.setItem(STORAGE_KEY, value);
    setPreference(value);
    const resolved = resolveTheme(value, window.matchMedia("(prefers-color-scheme: dark)").matches);
    setResolvedTheme(resolved);
    document.documentElement.dataset.theme = resolved;
    setOpen(false);
  }

  const isDark = resolvedTheme === "dark";
  return (
    <div className="relative">
      <button type="button" className="theme-switch" onClick={() => setOpen((value) => !value)} aria-label={label} aria-expanded={open}>
        <span className={`theme-switch-knob ${isDark ? "theme-switch-knob-dark" : ""}`}>{isDark ? <Moon size={14} /> : <Sun size={14} />}</span>
        <span className="sr-only">{label}</span>
      </button>
      {open ? <div className="preferences-popover" role="menu" aria-label={label}>
        <button type="button" role="menuitem" onClick={() => choose("light")}><Sun size={15} /> {copy.themeLight}</button>
        <button type="button" role="menuitem" onClick={() => choose("dark")}><Moon size={15} /> {copy.themeDark}</button>
        <button type="button" role="menuitem" onClick={() => choose("system")}><Monitor size={15} /> {copy.themeSystem} {preference === "system" ? "✓" : ""}</button>
      </div> : null}
    </div>
  );
}
