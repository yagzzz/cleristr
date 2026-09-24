import { describe, expect, it } from "vitest";
import { normalizeCookiePreferences } from "./cookie-preferences";

describe("normalizeCookiePreferences", () => {
  it("always retains essential storage and permits optional categories explicitly", () => {
    expect(normalizeCookiePreferences({ analytics: true, marketing: false })).toEqual({ essential: true, analytics: true, marketing: false });
  });

  it("treats malformed stored data as essential only", () => {
    expect(normalizeCookiePreferences(null)).toEqual({ essential: true, analytics: false, marketing: false });
  });
});
