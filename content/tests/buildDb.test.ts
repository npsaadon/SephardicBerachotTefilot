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
