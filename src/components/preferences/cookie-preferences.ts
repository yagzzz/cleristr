export type CookiePreferences = { essential: true; analytics: boolean; marketing: boolean };

export function normalizeCookiePreferences(value: unknown): CookiePreferences {
  if (!value || typeof value !== "object") return { essential: true, analytics: false, marketing: false };
  const source = value as Record<string, unknown>;
  return { essential: true, analytics: source.analytics === true, marketing: source.marketing === true };
}
