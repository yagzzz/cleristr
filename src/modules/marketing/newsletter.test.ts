import { describe, expect, it } from "vitest";
import { parseNewsletterInput } from "./newsletter";

describe("newsletter input", () => {
  it("normalizes a valid email and requires explicit marketing consent", () => {
    expect(parseNewsletterInput({ email: "  USER@Example.com ", consent: "on", company: "" })).toEqual({
      email: "user@example.com",
      consent: true,
    });
  });

  it("rejects submissions without consent", () => {
    expect(() => parseNewsletterInput({ email: "user@example.com", consent: "", company: "" })).toThrow();
  });

  it("rejects honeypot submissions", () => {
    expect(() => parseNewsletterInput({ email: "bot@example.com", consent: "on", company: "spam" })).toThrow("SPAM");
  });
});
