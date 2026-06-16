import berachotJson from "./data/berachot.json";
import categoriesJson from "./data/categories.json";
import foodsJson from "./data/foods.json";
import tefilotJson from "./data/tefilot.json";
import { Beracha, Category, Food, Tefila } from "./types";

export const BERACHOT = berachotJson as Beracha[];
export const CATEGORIES = (categoriesJson as Category[])
  .slice()
  .sort((a, b) => a.sortOrder - b.sortOrder);
export const FOODS = (foodsJson as Food[]).filter((f) => f.active);
export const TEFILOT = (tefilotJson as Tefila[])
  .filter((t) => t.active)
  .sort((a, b) => a.sortOrder - b.sortOrder);

const berachaByKey = new Map(BERACHOT.map((b) => [b.key, b]));
const categoryBySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));
const foodBySlug = new Map(FOODS.map((f) => [f.slug, f]));
const tefilaBySlug = new Map(TEFILOT.map((t) => [t.slug, t]));

export const getBeracha = (key: string | null): Beracha | undefined =>
  key ? berachaByKey.get(key) : undefined;
export const getCategory = (slug: string): Category | undefined =>
  categoryBySlug.get(slug);
export const getFood = (slug: string): Food | undefined => foodBySlug.get(slug);
export const getTefila = (slug: string): Tefila | undefined =>
  tefilaBySlug.get(slug);

export const foodsInCategory = (slug: string): Food[] =>
  FOODS.filter((f) => f.categorySlug === slug).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

export const categoryCount = (slug: string): number =>
  FOODS.reduce((n, f) => (f.categorySlug === slug ? n + 1 : n), 0);

const norm = (s: string) => s.toLowerCase().trim();

/** Offline food search over names + aliases, ranked by match quality. */
export function searchFoods(query: string, limit = 50): Food[] {
  const q = norm(query);
  if (!q) return [];
  const scored: { food: Food; score: number }[] = [];
  for (const food of FOODS) {
    const name = norm(food.name);
    const aliases = food.aliases.map(norm);
    let score = -1;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (aliases.some((a) => a === q)) score = 75;
    else if (aliases.some((a) => a.startsWith(q))) score = 60;
    else if (name.includes(q)) score = 45;
    else if (aliases.some((a) => a.includes(q))) score = 35;
    if (score >= 0) scored.push({ food, score });
  }
  scored.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.food.name.localeCompare(b.food.name)
  );
  return scored.slice(0, limit).map((s) => s.food);
}
