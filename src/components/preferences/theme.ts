export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  return preference === "system" ? (systemPrefersDark ? "dark" : "light") : preference;
}
