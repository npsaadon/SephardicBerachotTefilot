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
