// Imports the complete Siddur Edot HaMizrach (Hebrew) from Sefaria into a
// structured tree at content/data/siddur.json, preserving the distinction
// between section headers, halachic instructions, and prayer text.
// Run: npm run import:siddur   (from content/)
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const INDEX_TITLE = "Siddur Edot HaMizrach";
const RAW_INDEX_URL = `https://www.sefaria.org/api/v2/raw/index/${INDEX_TITLE.replace(
  / /g,
  "_"
)}`;

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "data");

// run kind: h = header, i = instruction, t = prayer text
export type Run = { k: "h" | "i" | "t"; s: string };
export type Line = Run[];

export interface SiddurNode {
  id: string;
  parentId: string | null;
  title: string;
  titleHe: string;
  order: number;
  isLeaf: boolean;
  group: string;
  sectionType: string;
  content?: Line[];
  ref?: string;
}

// Logical Sephardic ordering + grouping for the top-level sections.
const TITLE_META: Record<string, { type: string; order: number }> = {
  "Preparatory Prayers": { type: "daily", order: 1 },
  "Weekday Shacharit": { type: "daily", order: 2 },
  "Additions for Shacharit": { type: "daily", order: 3 },
  "Weekday Mincha": { type: "daily", order: 4 },
  "Weekday Arvit": { type: "daily", order: 5 },
  "Bedtime Shema": { type: "daily", order: 6 },
  "Blessings on Enjoyments": { type: "meals", order: 10 },
  "Post Meal Blessing": { type: "meals", order: 11 },
  "Al Hamihya": { type: "meals", order: 12 },
  "Shabbat Candle Lighting": { type: "shabbat", order: 20 },
  "Kabbalat Shabbat": { type: "shabbat", order: 21 },
  "Song of Songs": { type: "shabbat", order: 22 },
  "Shabbat Arvit": { type: "shabbat", order: 23 },
  "Shabbat Evening": { type: "shabbat", order: 24 },
  "Daytime Meal": { type: "shabbat", order: 25 },
  "Shabbat Shacharit": { type: "shabbat", order: 26 },
  "Shabbat Mussaf": { type: "shabbat", order: 27 },
  "Shabbat Mincha": { type: "shabbat", order: 28 },
  "Third Meal": { type: "shabbat", order: 29 },
  "Havdalah": { type: "shabbat", order: 30 },
  "Mishna Study for Shabbat": { type: "shabbat", order: 31 },
  "Prayers for Three Festivals": { type: "festival", order: 40 },
  "Hanukkah": { type: "festival", order: 41 },
  "Purim": { type: "festival", order: 42 },
  "Nissan": { type: "festival", order: 43 },
  "Counting of the Omer": { type: "festival", order: 44 },
  "Rosh Hodesh": { type: "occasion", order: 50 },
  "Blessing of the Moon": { type: "occasion", order: 51 },
  "Fast Days and Mourning": { type: "occasion", order: 52 },
  "The Midnight Rite": { type: "other", order: 60 },
  "Assorted Blessings and Prayers": { type: "other", order: 61 },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function enTitle(node: any): string {
  if (node.title) return node.title;
  const t =
    (node.titles || []).find((x: any) => x.lang === "en" && x.primary) ||
    (node.titles || []).find((x: any) => x.lang === "en");
  return t?.text ?? "";
}
function heTitle(node: any): string {
  if (node.heTitle) return node.heTitle;
  const t =
    (node.titles || []).find((x: any) => x.lang === "he" && x.primary) ||
    (node.titles || []).find((x: any) => x.lang === "he");
  return t?.text ?? "";
}

const decode = (s: string): string =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&thinsp;|&#8201;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&#8217;/g, "'");

/** Parse one HTML string into lines of styled runs. */
function parseHtml(html: string): Line[] {
  const lines: Line[] = [];
  let current: Line = [];
  let small = 0;
  let big = 0;
  // Tokenize into tags and text.
  const tokens = html.split(/(<[^>]+>)/g);
  const pushText = (raw: string) => {
    const text = decode(raw).replace(/\s+/g, " ");
    if (!text.trim()) return;
    const k: Run["k"] = small > 0 ? "i" : big > 0 ? "h" : "t";
    const last = current[current.length - 1];
    if (last && last.k === k) last.s += text;
    else current.push({ k, s: text });
  };
  for (const tok of tokens) {
    if (!tok) continue;
    if (tok[0] === "<") {
      const tag = tok.toLowerCase();
      if (/^<br\s*\/?>/.test(tag) || /^<\/(p|div)>/.test(tag)) {
        if (current.length) lines.push(current);
        current = [];
      } else if (/^<small/.test(tag)) small++;
      else if (/^<\/small/.test(tag)) small = Math.max(0, small - 1);
      else if (/^<(big|h\d)/.test(tag)) big++;
      else if (/^<\/(big|h\d)/.test(tag)) big = Math.max(0, big - 1);
      // <b>, </b>, <i>, spans, etc. are ignored (emphasis only)
    } else {
      pushText(tok);
    }
  }
  if (current.length) lines.push(current);
  return lines;
}

async function fetchContent(ref: string): Promise<Line[]> {
  const url = `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(
    ref
  )}?version=hebrew`;
  const res = await fetch(url, {
    headers: { "User-Agent": "SephardicBerachotApp/1.0 (content import)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: any = await res.json();
  const version = (json.versions || [])[0];
  if (!version?.text) return [];
  const out: Line[] = [];
  const walk = (t: any) => {
    if (Array.isArray(t)) t.forEach(walk);
    else if (typeof t === "string") out.push(...parseHtml(t));
  };
  walk(version.text);
  return out;
}

async function run() {
  console.log(`Fetching index: ${RAW_INDEX_URL}`);
  const idxRes = await fetch(RAW_INDEX_URL, {
    headers: { "User-Agent": "SephardicBerachotApp/1.0 (content import)" },
  });
  if (!idxRes.ok) throw new Error(`index HTTP ${idxRes.status}`);
  const index: any = await idxRes.json();
  const schema = index.schema;

  const nodes: SiddurNode[] = [];
  let leafCount = 0;
  let fetched = 0;
  let failed = 0;
  let topType = "other";
  let topOrder = 999;
  let topTitle = "";

  async function walk(
    node: any,
    ancestors: string[],
    parentId: string | null,
    order: number,
    depth: number
  ) {
    const en = enTitle(node);
    const he = heTitle(node);
    const isDefault = node.default === true;
    const path = isDefault ? ancestors : [...ancestors, en];
    const id = parentId ? `${parentId}/${slugify(en || "default")}` : slugify(en);
    const children = node.nodes as any[] | undefined;
    const isLeaf = !children || children.length === 0;

    if (depth === 0) {
      topTitle = en;
      const meta = TITLE_META[en] ?? { type: "other", order: 900 + order };
      topType = meta.type;
      topOrder = meta.order;
    }

    const record: SiddurNode = {
      id,
      parentId,
      title: en,
      titleHe: he,
      order: depth === 0 ? topOrder : order,
      isLeaf,
      group: topTitle,
      sectionType: topType,
    };

    if (isLeaf) {
      leafCount++;
      const ref = [INDEX_TITLE, ...path].join(", ");
      record.ref = ref;
      try {
        record.content = await fetchContent(ref);
        fetched++;
        if (fetched % 15 === 0) console.log(`  …fetched ${fetched} prayers`);
        await sleep(180);
      } catch (e) {
        // one retry
        try {
          await sleep(800);
          record.content = await fetchContent(ref);
          fetched++;
        } catch {
          failed++;
          record.content = [];
          console.warn(`  ! failed: ${ref} (${(e as Error).message})`);
        }
      }
    }

    nodes.push(record);
    if (children) {
      for (let i = 0; i < children.length; i++) {
        await walk(children[i], path, id, i, depth + 1);
      }
    }
  }

  const top = schema.nodes as any[];
  for (let i = 0; i < top.length; i++) await walk(top[i], [], null, i, 0);

  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, "siddur.json"), JSON.stringify(nodes) + "\n");
  console.log(
    `\n✅ siddur.json: ${nodes.length} nodes, ${leafCount} prayers (${fetched} ok, ${failed} failed)`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
