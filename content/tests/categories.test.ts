import { describe, it, expect } from "vitest";
import { CATEGORIES, categorySlugs } from "../src/categories";

describe("categories", () => {
  it("includes the key categories from the spec", () => {
    expect(categorySlugs).toContain("bread");
    expect(categorySlugs).toContain("grains");
    expect(categorySlugs).toContain("fruits");
    expect(categorySlugs).toContain("vegetables");
    expect(categorySlugs).toContain("drinks");
    expect(categorySlugs).toContain("mixed-foods");
  });

  it("has unique slugs", () => {
    expect(new Set(categorySlugs).size).toBe(categorySlugs.length);
  });

  it("has strictly defined sortOrder for each category", () => {
    for (const c of CATEGORIES) {
      expect(typeof c.sortOrder).toBe("number");
      expect(c.name.length).toBeGreaterThan(0);
    }
  });
});
