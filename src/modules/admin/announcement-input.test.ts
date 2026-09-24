import { describe, expect, it } from "vitest";
import { parseAnnouncementInput } from "./announcement-input";

describe("parseAnnouncementInput", () => {
  it("accepts a dismissible, internal announcement", () => {
    expect(parseAnnouncementInput({ message: "Kargo süreci güncellendi", href: "/magaza", dismissible: "on", isActive: "on" })).toEqual({ message: "Kargo süreci güncellendi", href: "/magaza", dismissible: true, isActive: true });
  });

  it("rejects unsafe external schemes", () => {
    expect(() => parseAnnouncementInput({ message: "X", href: "javascript:alert(1)", dismissible: "", isActive: "on" })).toThrow();
  });
});
