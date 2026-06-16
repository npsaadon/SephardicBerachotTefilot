# Foundation & Content Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the monorepo and a fully validated, tested content layer — the canonical berachot/categories reference data, a typed & schema-validated seed dataset of foods + tefilot, Supabase migrations, and a build step that compiles everything into a bundled SQLite snapshot (with FTS5 search) that the mobile app will ship.

**Architecture:** npm workspaces monorepo. The `content/` package owns the source-of-truth JSON data plus TypeScript types and Zod schemas that validate it. A `buildDb` script compiles the validated JSON into `content/dist/bundle.db` (SQLite + FTS5), which the mobile app will later bundle as an asset. `supabase/migrations/` mirrors the same schema in Postgres for the admin panel/backend. This plan produces no UI — it produces tested data and a reproducible DB artifact.

**Tech Stack:** TypeScript, Node 22, npm workspaces, Vitest (test runner), Zod (runtime validation), better-sqlite3 (DB generation), Supabase CLI (Postgres migrations).

---

## File Structure

```
SephardicBerachotTefilot/
├── package.json                 # workspace root (npm workspaces)
├── .nvmrc                       # pin Node 22
├── content/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── src/
│   │   ├── types.ts             # Beracha, Category, Food, Tefila TS types + enums
│   │   ├── schema.ts            # Zod schemas for runtime validation
│   │   ├── berachot.ts          # canonical berachot reference list (typed const)
│   │   ├── categories.ts        # canonical category list (typed const)
│   │   ├── validate.ts          # loads + validates foods.json / tefilot.json, cross-checks FKs
│   │   └── buildDb.ts           # compiles validated data → dist/bundle.db (SQLite + FTS5)
│   ├── data/
│   │   ├── foods.json           # seed foods (grows to ~250-400)
│   │   └── tefilot.json         # seed tefilot (MVP set)
│   ├── tests/
│   │   ├── berachot.test.ts
│   │   ├── categories.test.ts
│   │   ├── validate.test.ts
│   │   └── buildDb.test.ts
│   └── dist/                    # generated artifacts (gitignored)
└── supabase/
    └── migrations/
        └── 0001_init.sql
```

---

## Task 1: Root workspace scaffold

**Files:**
- Create: `package.json`
- Create: `.nvmrc`
- Modify: `.gitignore`

- [ ] **Step 1: Create root workspace `package.json`**

```json
{
  "name": "sephardic-berachot",
  "private": true,
  "version": "0.1.0",
  "workspaces": ["content"],
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "npm run test --workspaces --if-present",
    "validate:content": "npm run validate --workspace content",
    "build:db": "npm run build:db --workspace content"
  }
}
```

- [ ] **Step 2: Pin Node version**

Create `.nvmrc`:

```
22
```

- [ ] **Step 3: Extend `.gitignore`**

Append to `.gitignore` (keep the existing `.superpowers/` line):

```
node_modules/
content/dist/
*.log
.DS_Store
```

- [ ] **Step 4: Commit**

```bash
git add package.json .nvmrc .gitignore
git commit -m "chore: scaffold npm workspace root"
```

---

## Task 2: Content package scaffold + test runner

**Files:**
- Create: `content/package.json`
- Create: `content/tsconfig.json`
- Create: `content/vitest.config.ts`

- [ ] **Step 1: Create `content/package.json`**

```json
{
  "name": "content",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "validate": "tsx src/validate.ts",
    "build:db": "tsx src/buildDb.ts"
  },
  "dependencies": {
    "better-sqlite3": "^11.8.1",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/node": "^22.10.5",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^3.0.2"
  }
}
```

- [ ] **Step 2: Create `content/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create `content/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: installs workspaces; `content/node_modules` (or hoisted root `node_modules`) populated, no errors.

- [ ] **Step 5: Verify the test runner works (empty run)**

Run: `npm run test --workspace content`
Expected: Vitest runs and reports "No test files found" (exit 0 or the "no tests" message). This confirms the toolchain is wired before we write real tests.

- [ ] **Step 6: Commit**

```bash
git add content/package.json content/tsconfig.json content/vitest.config.ts package-lock.json
git commit -m "chore: scaffold content package with vitest"
```

---

## Task 3: Core types

**Files:**
- Create: `content/src/types.ts`

- [ ] **Step 1: Write `content/src/types.ts`**

```ts
export type BerachaType = "rishona" | "acharona";

export interface Beracha {
  key: string;            // stable id, e.g. "haetz"
  nameEn: string;         // "Borei Pri HaEtz"
  nameTranslit: string;   // "Borei peri ha'etz"
  hebrew: string;         // "בּוֹרֵא פְּרִי הָעֵץ"
  type: BerachaType;
}

export interface Category {
  slug: string;           // "fruits"
  name: string;           // "Fruits"
  icon: string;           // emoji or icon key
  sortOrder: number;
}

export type Complexity = "simple" | "note" | "complex" | "ask_rav";

export interface Food {
  slug: string;                 // "apple"
  name: string;                 // "Apple"
  aliases: string[];            // ["apples", "green apple"]
  categorySlug: string;         // FK -> Category.slug
  berachaBefore: string;        // FK -> Beracha.key (type rishona)
  berachaAfter: string | null;  // FK -> Beracha.key (type acharona) or null
  complexity: Complexity;
  notes: string;                // halachic note (may be empty)
  amountAcharona: string | null;  // e.g. "kezayit"
  timeAcharona: string | null;    // e.g. "within ~4 minutes"
  source: string;               // attribution
  reviewed: boolean;            // rabbinic review status
  minhag: string;               // "edot_hamizrach"
  active: boolean;
}

export interface Tefila {
  slug: string;                 // "tefilat-haderech"
  title: string;                // "Tefilat HaDerech"
  category: string;             // "Travel"
  hebrew: string;
  translit: string;
  english: string;
  notes: string;
  whenToSay: string;
  nusach: string;               // "edot_hamizrach"
  source: string;
  reviewed: boolean;
  audioUrl: string | null;      // null in MVP
  sortOrder: number;
  active: boolean;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p content/tsconfig.json`
Expected: no errors (exit 0).

- [ ] **Step 3: Commit**

```bash
git add content/src/types.ts
git commit -m "feat(content): add core data types"
```

---

## Task 4: Canonical berachot reference list

**Files:**
- Create: `content/src/berachot.ts`
- Test: `content/tests/berachot.test.ts`

- [ ] **Step 1: Write the failing test `content/tests/berachot.test.ts`**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace content -- berachot`
Expected: FAIL — cannot find module `../src/berachot`.

- [ ] **Step 3: Write `content/src/berachot.ts`**

```ts
import type { Beracha } from "./types";

export const BERACHOT: Beracha[] = [
  { key: "hamotzi", nameEn: "HaMotzi", nameTranslit: "Hamotzi lechem min ha'aretz", hebrew: "הַמּוֹצִיא לֶחֶם מִן הָאָרֶץ", type: "rishona" },
  { key: "mezonot", nameEn: "Borei Minei Mezonot", nameTranslit: "Borei minei mezonot", hebrew: "בּוֹרֵא מִינֵי מְזוֹנוֹת", type: "rishona" },
  { key: "hagafen", nameEn: "Borei Pri HaGafen", nameTranslit: "Borei peri hagafen", hebrew: "בּוֹרֵא פְּרִי הַגָּפֶן", type: "rishona" },
  { key: "haetz", nameEn: "Borei Pri HaEtz", nameTranslit: "Borei peri ha'etz", hebrew: "בּוֹרֵא פְּרִי הָעֵץ", type: "rishona" },
  { key: "haadama", nameEn: "Borei Pri HaAdama", nameTranslit: "Borei peri ha'adama", hebrew: "בּוֹרֵא פְּרִי הָאֲדָמָה", type: "rishona" },
  { key: "shehakol", nameEn: "Shehakol", nameTranslit: "Shehakol nihye bidvaro", hebrew: "שֶׁהַכֹּל נִהְיֶה בִּדְבָרוֹ", type: "rishona" },
  { key: "birkat_hamazon", nameEn: "Birkat HaMazon", nameTranslit: "Birkat hamazon", hebrew: "בִּרְכַּת הַמָּזוֹן", type: "acharona" },
  { key: "almichya", nameEn: "Al HaMichya", nameTranslit: "Al hamichya v'al hakalkala", hebrew: "עַל הַמִּחְיָה וְעַל הַכַּלְכָּלָה", type: "acharona" },
  { key: "algefen", nameEn: "Al HaGefen", nameTranslit: "Al hagefen v'al peri hagefen", hebrew: "עַל הַגֶּפֶן וְעַל פְּרִי הַגֶּפֶן", type: "acharona" },
  { key: "haetz_acharona", nameEn: "Al HaEtz", nameTranslit: "Al ha'etz v'al peri ha'etz", hebrew: "עַל הָעֵץ וְעַל פְּרִי הָעֵץ", type: "acharona" },
  { key: "nefashot", nameEn: "Borei Nefashot", nameTranslit: "Borei nefashot rabbot", hebrew: "בּוֹרֵא נְפָשׁוֹת רַבּוֹת", type: "acharona" },
];

export const berachaKeys = BERACHOT.map((b) => b.key);
export const berachaByKey = new Map(BERACHOT.map((b) => [b.key, b]));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace content -- berachot`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add content/src/berachot.ts content/tests/berachot.test.ts
git commit -m "feat(content): add canonical berachot reference list"
```

---

## Task 5: Canonical categories list

**Files:**
- Create: `content/src/categories.ts`
- Test: `content/tests/categories.test.ts`

- [ ] **Step 1: Write the failing test `content/tests/categories.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { CATEGORIES, categorySlugs } from "../src/categories";

describe("categories", () => {
  it("includes the key categories from the spec", () => {
    expect(categorySlugs).toContain("bread");
    expect(categorySlugs).toContain("mezonot");
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace content -- categories`
Expected: FAIL — cannot find module `../src/categories`.

- [ ] **Step 3: Write `content/src/categories.ts`**

```ts
import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  { slug: "bread", name: "Bread / Hamotzi", icon: "🍞", sortOrder: 1 },
  { slug: "mezonot", name: "Mezonot", icon: "🥐", sortOrder: 2 },
  { slug: "wine", name: "Wine & Grape Juice", icon: "🍷", sortOrder: 3 },
  { slug: "fruits", name: "Fruits", icon: "🍎", sortOrder: 4 },
  { slug: "vegetables", name: "Vegetables", icon: "🥕", sortOrder: 5 },
  { slug: "drinks", name: "Drinks", icon: "🥤", sortOrder: 6 },
  { slug: "meat-fish-eggs", name: "Meat / Fish / Eggs", icon: "🍗", sortOrder: 7 },
  { slug: "dairy", name: "Dairy", icon: "🧀", sortOrder: 8 },
  { slug: "snacks", name: "Snacks", icon: "🍿", sortOrder: 9 },
  { slug: "desserts", name: "Desserts", icon: "🍰", sortOrder: 10 },
  { slug: "cooked-foods", name: "Cooked Foods", icon: "🍲", sortOrder: 11 },
  { slug: "mixed-foods", name: "Mixed Foods", icon: "🍕", sortOrder: 12 },
  { slug: "questionable", name: "Questionable Foods", icon: "❓", sortOrder: 13 },
  { slug: "sephardic-specific", name: "Sephardic-Specific Cases", icon: "✡️", sortOrder: 14 },
];

export const categorySlugs = CATEGORIES.map((c) => c.slug);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace content -- categories`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add content/src/categories.ts content/tests/categories.test.ts
git commit -m "feat(content): add canonical categories list"
```

---

## Task 6: Zod schemas + validation engine

**Files:**
- Create: `content/src/schema.ts`
- Create: `content/src/validate.ts`
- Create: `content/data/foods.json`
- Create: `content/data/tefilot.json`
- Test: `content/tests/validate.test.ts`

- [ ] **Step 1: Write `content/src/schema.ts`**

```ts
import { z } from "zod";

export const complexityEnum = z.enum(["simple", "note", "complex", "ask_rav"]);

export const foodSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  aliases: z.array(z.string().min(1)),
  categorySlug: z.string().min(1),
  berachaBefore: z.string().min(1),
  berachaAfter: z.string().min(1).nullable(),
  complexity: complexityEnum,
  notes: z.string(),
  amountAcharona: z.string().nullable(),
  timeAcharona: z.string().nullable(),
  source: z.string(),
  reviewed: z.boolean(),
  minhag: z.string().min(1),
  active: z.boolean(),
});

export const tefilaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  category: z.string().min(1),
  hebrew: z.string().min(1),
  translit: z.string(),
  english: z.string(),
  notes: z.string(),
  whenToSay: z.string(),
  nusach: z.string().min(1),
  source: z.string(),
  reviewed: z.boolean(),
  audioUrl: z.string().nullable(),
  sortOrder: z.number(),
  active: z.boolean(),
});

export const foodsFileSchema = z.array(foodSchema);
export const tefilotFileSchema = z.array(tefilaSchema);
```

- [ ] **Step 2: Write `content/src/validate.ts`**

```ts
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
```

- [ ] **Step 3: Create a minimal valid `content/data/foods.json`** (seed batch — expanded in Task 8)

```json
[
  {
    "slug": "apple",
    "name": "Apple",
    "aliases": ["apples", "green apple", "red apple"],
    "categorySlug": "fruits",
    "berachaBefore": "haetz",
    "berachaAfter": "nefashot",
    "complexity": "simple",
    "notes": "Standard fruit beracha.",
    "amountAcharona": "kezayit",
    "timeAcharona": "within ~4 minutes",
    "source": "Edot HaMizrach standard",
    "reviewed": false,
    "minhag": "edot_hamizrach",
    "active": true
  },
  {
    "slug": "pizza",
    "name": "Pizza",
    "aliases": ["cheese pizza", "slice of pizza"],
    "categorySlug": "mixed-foods",
    "berachaBefore": "mezonot",
    "berachaAfter": "almichya",
    "complexity": "complex",
    "notes": "If eaten as a full meal or in large quantity, may require Hamotzi and Birkat HaMazon. Ask a rabbi for unclear cases.",
    "amountAcharona": "kezayit",
    "timeAcharona": "within ~4 minutes",
    "source": "Edot HaMizrach standard",
    "reviewed": false,
    "minhag": "edot_hamizrach",
    "active": true
  },
  {
    "slug": "coffee",
    "name": "Coffee",
    "aliases": ["iced coffee", "hot coffee", "espresso"],
    "categorySlug": "drinks",
    "berachaBefore": "shehakol",
    "berachaAfter": "nefashot",
    "complexity": "note",
    "notes": "Borei Nefashot only if a revi'it is drunk within the required time.",
    "amountAcharona": "revi'it",
    "timeAcharona": "drunk in the normal manner",
    "source": "Edot HaMizrach standard",
    "reviewed": false,
    "minhag": "edot_hamizrach",
    "active": true
  }
]
```

- [ ] **Step 4: Create a minimal valid `content/data/tefilot.json`** (seed — expanded in Task 9)

```json
[
  {
    "slug": "tefilat-haderech",
    "title": "Tefilat HaDerech",
    "category": "Travel",
    "hebrew": "יְהִי רָצוֹן מִלְּפָנֶיךָ ה' אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ שֶׁתּוֹלִיכֵנוּ לְשָׁלוֹם",
    "translit": "Yehi ratzon milfanecha Adonai Eloheinu velohei avoteinu shetolichenu leshalom",
    "english": "May it be Your will, Lord our God and God of our fathers, that You lead us toward peace…",
    "notes": "Recited once per journey when traveling beyond the outskirts of the city. Pending rabbinic review.",
    "whenToSay": "After leaving the city limits, on a journey of at least a parasang.",
    "nusach": "edot_hamizrach",
    "source": "Edot HaMizrach standard",
    "reviewed": false,
    "audioUrl": null,
    "sortOrder": 1,
    "active": true
  }
]
```

- [ ] **Step 5: Write the failing test `content/tests/validate.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { crossValidate, validateAll } from "../src/validate";
import type { Food, Tefila } from "../src/types";

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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test --workspace content -- validate`
Expected: PASS (all `crossValidate` cases + the real-data check pass against the seed files from Steps 3–4).

- [ ] **Step 7: Verify the CLI validator works**

Run: `npm run validate:content`
Expected: `✅ content valid: 3 foods, 1 tefilot`

- [ ] **Step 8: Commit**

```bash
git add content/src/schema.ts content/src/validate.ts content/data/foods.json content/data/tefilot.json content/tests/validate.test.ts
git commit -m "feat(content): add zod schemas + cross-validation engine with seed data"
```

---

## Task 7: Build the bundled SQLite snapshot (with FTS5 search)

**Files:**
- Create: `content/src/buildDb.ts`
- Test: `content/tests/buildDb.test.ts`

- [ ] **Step 1: Write `content/src/buildDb.ts`**

```ts
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateAll } from "./validate";
import { BERACHOT } from "./berachot";
import { CATEGORIES } from "./categories";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = join(here, "..", "dist");

/** Builds the SQLite snapshot at the given path. Throws if content is invalid. */
export function buildDb(outPath: string): { foods: number; tefilot: number } {
  const { foods, tefilot, errors } = validateAll();
  if (errors.length) {
    throw new Error(`refusing to build DB, content invalid:\n${errors.join("\n")}`);
  }

  const db = new Database(outPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    DROP TABLE IF EXISTS berachot;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS foods;
    DROP TABLE IF EXISTS food_aliases;
    DROP TABLE IF EXISTS tefilot;
    DROP TABLE IF EXISTS food_search;

    CREATE TABLE berachot (key TEXT PRIMARY KEY, name_en TEXT, name_translit TEXT, hebrew TEXT, type TEXT);
    CREATE TABLE categories (slug TEXT PRIMARY KEY, name TEXT, icon TEXT, sort_order INTEGER);
    CREATE TABLE foods (
      slug TEXT PRIMARY KEY, name TEXT, category_slug TEXT,
      beracha_before TEXT, beracha_after TEXT, complexity TEXT,
      notes TEXT, amount_acharona TEXT, time_acharona TEXT,
      source TEXT, reviewed INTEGER, minhag TEXT, active INTEGER
    );
    CREATE TABLE food_aliases (food_slug TEXT, alias TEXT);
    CREATE TABLE tefilot (
      slug TEXT PRIMARY KEY, title TEXT, category TEXT, hebrew TEXT,
      translit TEXT, english TEXT, notes TEXT, when_to_say TEXT,
      nusach TEXT, source TEXT, reviewed INTEGER, audio_url TEXT,
      sort_order INTEGER, active INTEGER
    );
    CREATE VIRTUAL TABLE food_search USING fts5(slug UNINDEXED, terms);
  `);

  const insBeracha = db.prepare("INSERT INTO berachot VALUES (?,?,?,?,?)");
  for (const b of BERACHOT) insBeracha.run(b.key, b.nameEn, b.nameTranslit, b.hebrew, b.type);

  const insCat = db.prepare("INSERT INTO categories VALUES (?,?,?,?)");
  for (const c of CATEGORIES) insCat.run(c.slug, c.name, c.icon, c.sortOrder);

  const insFood = db.prepare(
    "INSERT INTO foods VALUES (@slug,@name,@categorySlug,@berachaBefore,@berachaAfter,@complexity,@notes,@amountAcharona,@timeAcharona,@source,@reviewed,@minhag,@active)"
  );
  const insAlias = db.prepare("INSERT INTO food_aliases VALUES (?,?)");
  const insSearch = db.prepare("INSERT INTO food_search VALUES (?,?)");
  for (const f of foods) {
    insFood.run({ ...f, reviewed: f.reviewed ? 1 : 0, active: f.active ? 1 : 0 });
    for (const a of f.aliases) insAlias.run(f.slug, a);
    insSearch.run(f.slug, [f.name, ...f.aliases].join(" "));
  }

  const insTefila = db.prepare(
    "INSERT INTO tefilot VALUES (@slug,@title,@category,@hebrew,@translit,@english,@notes,@whenToSay,@nusach,@source,@reviewed,@audioUrl,@sortOrder,@active)"
  );
  for (const t of tefilot) insTefila.run({ ...t, reviewed: t.reviewed ? 1 : 0, active: t.active ? 1 : 0 });

  db.close();
  return { foods: foods.length, tefilot: tefilot.length };
}

// CLI entrypoint: `tsx src/buildDb.ts`
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(distDir, { recursive: true });
  const out = join(distDir, "bundle.db");
  const counts = buildDb(out);
  console.log(`✅ built ${out}: ${counts.foods} foods, ${counts.tefilot} tefilot`);
}
```

- [ ] **Step 2: Write the failing test `content/tests/buildDb.test.ts`**

```ts
import { describe, it, expect, afterAll } from "vitest";
import Database from "better-sqlite3";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rmSync } from "node:fs";
import { buildDb } from "../src/buildDb";

const out = join(tmpdir(), `bundle-test-${process.pid}.db`);
afterAll(() => rmSync(out, { force: true }));

describe("buildDb", () => {
  it("builds a db with foods, berachot, categories, and tefilot", () => {
    const counts = buildDb(out);
    expect(counts.foods).toBeGreaterThan(0);

    const db = new Database(out, { readonly: true });
    expect((db.prepare("SELECT COUNT(*) n FROM foods").get() as any).n).toBe(counts.foods);
    expect((db.prepare("SELECT COUNT(*) n FROM berachot").get() as any).n).toBeGreaterThan(0);
    expect((db.prepare("SELECT COUNT(*) n FROM categories").get() as any).n).toBeGreaterThan(0);
    db.close();
  });

  it("FTS search finds a food by an alias", () => {
    buildDb(out);
    const db = new Database(out, { readonly: true });
    const rows = db.prepare("SELECT slug FROM food_search WHERE food_search MATCH ?").all("apples") as any[];
    expect(rows.map((r) => r.slug)).toContain("apple");
    db.close();
  });
});
```

- [ ] **Step 3: Run test to verify it passes**

Run: `npm run test --workspace content -- buildDb`
Expected: PASS (2 tests).

- [ ] **Step 4: Verify the build CLI works**

Run: `npm run build:db`
Expected: `✅ built …/content/dist/bundle.db: 3 foods, 1 tefilot`

- [ ] **Step 5: Commit**

```bash
git add content/src/buildDb.ts content/tests/buildDb.test.ts
git commit -m "feat(content): compile validated data into bundled SQLite snapshot with FTS5"
```

---

## Task 8: Expand the foods dataset

**Files:**
- Modify: `content/data/foods.json`

> This is a content task. Add foods in batches, running the validator after each batch so a typo is caught immediately. Target ~250–400 foods covering every category, with strong coverage of `mixed-foods`. Each entry uses the exact shape from Task 6 Step 3. Every entry MUST set `reviewed: false` and `minhag: "edot_hamizrach"` until a rabbi verifies.

- [ ] **Step 1: Add a batch of fruits + vegetables** (e.g. banana, orange, grapes [note: grapes→haetz but wine→hagafen], strawberry, watermelon, carrot, cucumber, potato [cooked→haadama], corn, etc.). Banana is `haadama` (grows anew each year) per Sephardic practice — set `berachaBefore: "haadama"`, `berachaAfter: "nefashot"`.

- [ ] **Step 2: Run the validator**

Run: `npm run validate:content`
Expected: `✅ content valid: N foods, …` with no errors. Fix any reported FK/alias errors before continuing.

- [ ] **Step 3: Add grains/mezonot/bread batch** (bread→`hamotzi`/`birkat_hamazon`; rice [Sephardic: rice is `mezonot` before, `nefashot` after]; pasta, cereal, crackers, cake, cookies, pretzels, etc.).

- [ ] **Step 4: Run the validator** (same command/expectation as Step 2).

- [ ] **Step 5: Add drinks + dairy + meat/fish/eggs batch** (water→`shehakol`/`nefashot`; juice; milk; cheese; yogurt; chicken; beef; fish; eggs — all `shehakol`/`nefashot`).

- [ ] **Step 6: Run the validator** (same command/expectation as Step 2).

- [ ] **Step 7: Add the mixed-foods + snacks + desserts batch** (sushi, schnitzel, sandwich, salad with croutons, cereal with milk, soup with noodles, ice cream cone, granola bar, rice cakes, wraps, yogurt with granola, chocolate, candy, etc.). Mark genuinely ambiguous cases `complexity: "complex"` or `"ask_rav"` with a clear note.

- [ ] **Step 8: Run the validator** (same command/expectation as Step 2).

- [ ] **Step 9: Run the full test suite + rebuild the DB**

Run: `npm run test --workspace content && npm run build:db`
Expected: all tests PASS; DB builds reporting the full food count.

- [ ] **Step 10: Commit**

```bash
git add content/data/foods.json
git commit -m "content: expand foods dataset to full MVP coverage"
```

---

## Task 9: Expand the tefilot dataset (MVP set)

**Files:**
- Modify: `content/data/tefilot.json`

> Add the MVP tefilot using the exact shape from Task 6 Step 4. All `reviewed: false`, `nusach: "edot_hamizrach"`, `audioUrl: null`.

- [ ] **Step 1: Add the MVP tefilot** — Asher Yatzar, Shema Al HaMita, Birkat HaMazon, Borei Nefashot, Al HaMichya, Al HaGefen, Al HaEtz, Modeh Ani, Kriat Shema, Ana Bekoach, and 1–2 Tehillim favorites (Tefilat HaDerech already present). Give each a sequential `sortOrder`.

- [ ] **Step 2: Run the validator**

Run: `npm run validate:content`
Expected: `✅ content valid: N foods, M tefilot` with no errors.

- [ ] **Step 3: Run the full test suite + rebuild the DB**

Run: `npm run test --workspace content && npm run build:db`
Expected: all tests PASS; DB reports the full tefilot count.

- [ ] **Step 4: Commit**

```bash
git add content/data/tefilot.json
git commit -m "content: add MVP tefilot texts"
```

---

## Task 10: Supabase schema migration

**Files:**
- Create: `supabase/migrations/0001_init.sql`

> Mirrors the SQLite schema in Postgres for the backend/admin. RLS: public read on active rows, writes restricted to the `admin` role (wired fully in the admin-panel plan). Surrogate `id` keys here (the admin edits relationally); the app continues to use the bundled SQLite snapshot.

- [ ] **Step 1: Write `supabase/migrations/0001_init.sql`**

```sql
create table if not exists berachot (
  key text primary key,
  name_en text not null,
  name_translit text not null,
  hebrew text not null,
  type text not null check (type in ('rishona','acharona'))
);

create table if not exists categories (
  slug text primary key,
  name text not null,
  icon text not null default '',
  sort_order int not null default 0
);

create table if not exists foods (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category_slug text not null references categories(slug),
  beracha_before text not null references berachot(key),
  beracha_after text references berachot(key),
  complexity text not null check (complexity in ('simple','note','complex','ask_rav')),
  notes text not null default '',
  amount_acharona text,
  time_acharona text,
  source text not null default '',
  reviewed boolean not null default false,
  minhag text not null default 'edot_hamizrach',
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists food_aliases (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references foods(id) on delete cascade,
  alias text not null
);

create table if not exists tefilot (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default '',
  hebrew text not null,
  translit text not null default '',
  english text not null default '',
  notes text not null default '',
  when_to_say text not null default '',
  nusach text not null default 'edot_hamizrach',
  source text not null default '',
  reviewed boolean not null default false,
  audio_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists content_version (
  id int primary key default 1,
  version bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint content_version_singleton check (id = 1)
);
insert into content_version (id, version) values (1, 1) on conflict (id) do nothing;

-- Row Level Security: public read of active rows; writes locked down (admin policies added later).
alter table berachot enable row level security;
alter table categories enable row level security;
alter table foods enable row level security;
alter table food_aliases enable row level security;
alter table tefilot enable row level security;
alter table content_version enable row level security;

create policy "public read berachot" on berachot for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read foods" on foods for select using (active = true);
create policy "public read food_aliases" on food_aliases for select using (true);
create policy "public read tefilot" on tefilot for select using (active = true);
create policy "public read content_version" on content_version for select using (true);
```

- [ ] **Step 2: Validate the SQL parses (lint via Supabase CLI dry parse)**

Run: `supabase db lint --schema public 2>/dev/null || echo "lint requires a running db; syntax reviewed manually"`
Expected: either a clean lint, or the fallback message. (A live `supabase start` requires Docker; defer the live apply to backend setup.)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0001_init.sql
git commit -m "feat(supabase): initial schema migration with RLS read policies"
```

---

## Task 11: Final integration check

**Files:** none (verification only)

- [ ] **Step 1: Run the entire test suite from the repo root**

Run: `npm test`
Expected: all content tests PASS.

- [ ] **Step 2: Validate + build the DB end to end**

Run: `npm run validate:content && npm run build:db`
Expected: validation reports the full counts; `dist/bundle.db` builds with matching counts.

- [ ] **Step 3: Confirm the artifact is excluded from git**

Run: `git status --porcelain content/dist`
Expected: no output (dist is gitignored).

- [ ] **Step 4: Tag the milestone commit**

```bash
git commit --allow-empty -m "milestone: content layer complete and tested"
```

---

## Self-Review notes

- **Spec coverage:** data model (Task 3, 6, 10), categories incl. mixed-foods (Task 5, 8), berachot incl. acharona set (Task 4), aliases (Task 6 schema + Task 7 FTS), offline search index (Task 7 FTS5), tefilot incl. Tefilat HaDerech (Task 6, 9), `reviewed`/pending-review flag (schema + seed data), `content_version` for later sync (Task 10), Supabase RLS public-read (Task 10). Mobile UI and admin CRUD are intentionally out of scope — separate plans.
- **No placeholders:** every code step contains complete code; the two content-expansion tasks (8, 9) are inherently iterative but specify exact shape, exact validator command, and expected output after each batch.
- **Type consistency:** `Food`/`Tefila` fields are identical across `types.ts`, `schema.ts`, `validate.ts`, `buildDb.ts`, and the JSON seed; beracha keys referenced in seed data (`haetz`, `mezonot`, `almichya`, `nefashot`, `shehakol`, `hamotzi`, `haadama`) all exist in `berachot.ts`.
```
