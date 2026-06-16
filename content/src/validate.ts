import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { foodsFileSchema, tefilotFileSchema } from "./schema";
import { berachaByKey } from "./berachot";
import { categorySlugs } from "./categories";
import type { Food, Tefila } from "./types";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "data");

export function loadFoods(): Food[] {
  const raw = JSON.parse(readFileSync(join(dataDir, "foods.json"), "utf8"));
  return foodsFileSchema.parse(raw);
}

export function loadTefilot(): Tefila[] {
  const raw = JSON.parse(readFileSync(join(dataDir, "tefilot.json"), "utf8"));
  return tefilotFileSchema.parse(raw);
}

/** Returns an array of human-readable error strings. Empty array = valid. */
export function crossValidate(foods: Food[], tefilot: Tefila[]): string[] {
  const errors: string[] = [];
  const catSet = new Set(categorySlugs);
  const foodSlugs = new Set<string>();
  const aliasSeen = new Map<string, string>();

  for (const f of foods) {
    if (foodSlugs.has(f.slug)) errors.push(`duplicate food slug: ${f.slug}`);
    foodSlugs.add(f.slug);

    if (!catSet.has(f.categorySlug)) errors.push(`food ${f.slug}: unknown category ${f.categorySlug}`);

    const before = berachaByKey.get(f.berachaBefore);
    if (!before) errors.push(`food ${f.slug}: unknown berachaBefore ${f.berachaBefore}`);
    else if (before.type !== "rishona") errors.push(`food ${f.slug}: berachaBefore ${f.berachaBefore} is not a rishona`);

    if (f.berachaAfter !== null) {
      const after = berachaByKey.get(f.berachaAfter);
      if (!after) errors.push(`food ${f.slug}: unknown berachaAfter ${f.berachaAfter}`);
      else if (after.type !== "acharona") errors.push(`food ${f.slug}: berachaAfter ${f.berachaAfter} is not an acharona`);
    }

    for (const alias of f.aliases) {
      const norm = alias.toLowerCase().trim();
      if (aliasSeen.has(norm)) errors.push(`alias "${alias}" used by both ${aliasSeen.get(norm)} and ${f.slug}`);
      else aliasSeen.set(norm, f.slug);
    }
  }

  const tefilaSlugs = new Set<string>();
  for (const t of tefilot) {
    if (tefilaSlugs.has(t.slug)) errors.push(`duplicate tefila slug: ${t.slug}`);
    tefilaSlugs.add(t.slug);
  }

  return errors;
}

export function validateAll(): { foods: Food[]; tefilot: Tefila[]; errors: string[] } {
  const foods = loadFoods();
  const tefilot = loadTefilot();
  const errors = crossValidate(foods, tefilot);
  return { foods, tefilot, errors };
}

// CLI entrypoint: `tsx src/validate.ts`
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { foods, tefilot, errors } = validateAll();
  if (errors.length) {
    console.error(`❌ ${errors.length} content error(s):`);
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`✅ content valid: ${foods.length} foods, ${tefilot.length} tefilot`);
}
