import { describe, expect, it } from "vitest";
import { parseFeedbackInput } from "./input";

describe("parseFeedbackInput", () => {
  it("accepts concise, actionable feedback", () => {
    expect(parseFeedbackInput({ type: "suggestion", message: "Ürün sayfasında beden rehberi görmek istiyorum.", pageUrl: "/urun/baggy-esofman-alti-unisex-oversize", company: "" })).toMatchObject({ type: "suggestion", pageUrl: "/urun/baggy-esofman-alti-unisex-oversize" });
  });

  it("rejects hidden spam input", () => {
    expect(() => parseFeedbackInput({ type: "bug", message: "Bir hata var", pageUrl: "/", company: "bot" })).toThrow("SPAM");
  });
});
