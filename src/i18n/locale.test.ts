import { describe, expect, it } from "vitest";
import { copy, normalizeLocale } from "./locale";

describe("normalizeLocale", () => {
  it("accepts the CLERIS public locales", () => {
    expect(normalizeLocale("tr")).toBe("tr");
    expect(normalizeLocale("en")).toBe("en");
  });

  it("falls back to Turkish for unknown locale values", () => {
    expect(normalizeLocale("de")).toBe("tr");
    expect(normalizeLocale(null)).toBe("tr");
  });

  it("provides localized labels for theme, cookie, and feedback controls", () => {
    expect(copy.tr.themeLight).toBe("Açık");
    expect(copy.en.themeLight).toBe("Light");
    expect(copy.tr.feedbackTitle).toBe("Bu sayfa nasıl?");
    expect(copy.en.feedbackTitle).toBe("How is this page?");
    expect(copy.en.cookieAnalytics).toBe("Analytics");
  });
});
