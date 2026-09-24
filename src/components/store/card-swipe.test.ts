import { describe, expect, it } from "vitest";
import { getSwipeDirection } from "./card-swipe";

describe("getSwipeDirection", () => {
  it("advances on a committed left swipe or fast left velocity", () => {
    expect(getSwipeDirection(-55, 0)).toBe("next");
    expect(getSwipeDirection(-5, -650)).toBe("next");
  });

  it("goes back on a committed right swipe and otherwise snaps", () => {
    expect(getSwipeDirection(55, 0)).toBe("previous");
    expect(getSwipeDirection(8, 0)).toBe("stay");
  });
});
