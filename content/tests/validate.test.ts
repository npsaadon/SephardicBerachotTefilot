import { describe, it, expect } from "vitest";
import { crossValidate, validateAll } from "../src/validate";
import type { Food } from "../src/types";

const baseFood: Food = {
  slug: "apple", name: "Apple", aliases: ["apples"], categorySlug: "fruits",
  berachaBefore: "haetz", berachaAfter: "nefashot", complexity: "simple",
  notes: "", amountAcharona: "kezayit", timeAcharona: "within ~4 minutes",
  source: "test", reviewed: false, minhag: "edot_hamizrach", active: true,
};

describe("crossValidate", () => {
  it("passes for a valid food", () => {
    expect(crossValidate([baseFood], [])).toEqual([]);
  });

  it("flags an unknown category", () => {
    const bad = { ...baseFood, categorySlug: "nope" };
    expect(crossValidate([bad], []).join()).toContain("unknown category");
  });

  it("flags a before-beracha that is actually an acharona", () => {
    const bad = { ...baseFood, berachaBefore: "nefashot" };
    expect(crossValidate([bad], []).join()).toContain("not a rishona");
  });

  it("flags an after-beracha that is actually a rishona", () => {
    const bad = { ...baseFood, berachaAfter: "haetz" };
    expect(crossValidate([bad], []).join()).toContain("not an acharona");
  });

  it("flags duplicate food slugs", () => {
    expect(crossValidate([baseFood, baseFood], []).join()).toContain("duplicate food slug");
  });

  it("flags an alias shared across two foods", () => {
    const other: Food = { ...baseFood, slug: "apple2", aliases: ["apples"] };
    expect(crossValidate([baseFood, other], []).join()).toContain("alias");
  });

  it("allows a null after-beracha", () => {
    const bread = { ...baseFood, slug: "bread", berachaBefore: "hamotzi", berachaAfter: null };
    expect(crossValidate([bread], [])).toEqual([]);
  });
});

describe("validateAll (real data files)", () => {
  it("the committed seed data is valid", () => {
    const { errors } = validateAll();
    expect(errors).toEqual([]);
  });
});
