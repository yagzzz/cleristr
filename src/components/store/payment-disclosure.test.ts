import { describe, expect, it } from "vitest";
import { canOpenPaytrDisclosure } from "./payment-disclosure";

describe("canOpenPaytrDisclosure", () => {
  it("requires a selected, available variant and a real price", () => {
    expect(canOpenPaytrDisclosure({ selected: true, available: true, priceAmount: 119900 })).toBe(true);
    expect(canOpenPaytrDisclosure({ selected: false, available: true, priceAmount: 119900 })).toBe(false);
    expect(canOpenPaytrDisclosure({ selected: true, available: true, priceAmount: null })).toBe(false);
  });
});
