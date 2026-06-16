import { describe, it, expect } from "vitest";
import { BERACHOT, berachaKeys } from "../src/berachot";

describe("berachot reference list", () => {
  it("includes the core rishona and acharona berachot", () => {
    expect(berachaKeys).toContain("haetz");
    expect(berachaKeys).toContain("haadama");
    expect(berachaKeys).toContain("mezonot");
    expect(berachaKeys).toContain("shehakol");
    expect(berachaKeys).toContain("hamotzi");
    expect(berachaKeys).toContain("hagafen");
    expect(berachaKeys).toContain("nefashot");
    expect(berachaKeys).toContain("almichya");
    expect(berachaKeys).toContain("algefen");
    expect(berachaKeys).toContain("haetz_acharona");
    expect(berachaKeys).toContain("birkat_hamazon");
  });

  it("has unique keys", () => {
    expect(new Set(berachaKeys).size).toBe(berachaKeys.length);
  });

  it("every beracha has non-empty hebrew, names, and a valid type", () => {
    for (const b of BERACHOT) {
      expect(b.hebrew.length).toBeGreaterThan(0);
      expect(b.nameEn.length).toBeGreaterThan(0);
      expect(b.nameTranslit.length).toBeGreaterThan(0);
      expect(["rishona", "acharona"]).toContain(b.type);
    }
  });
});
