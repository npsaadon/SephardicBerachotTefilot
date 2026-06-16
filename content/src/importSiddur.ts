// Imports the complete Siddur Edot HaMizrach (Hebrew) from Sefaria into a
// structured tree at content/data/siddur.json.
// Run: npm run import:siddur   (from content/)
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const INDEX_TITLE = "Siddur Edot HaMizrach";
const RAW_INDEX_URL = `https://www.sefaria.org/api/v2/raw/index/${encodeURIComponent(
  INDEX_TITLE
).replace(/%20/g, "_")}`;

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "data");

export interface SiddurNode {
  id: string;
  parentId: string | null;
  title: string;
  titleHe: string;
  order: number;
  isLeaf: boolean;
  group: string; // top-level section title
  sectionType: string;
  hebrew?: string;
  ref?: string;
}

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
  const t = (node.titles || []).find((x: any) => x.lang === "en" && x.primary)
    || (node.titles || []).find((x: any) => x.lang === "en");
  return t?.text ?? "";
}

function heTitle(node: any): string {
  if (node.heTitle) return node.heTitle;
  const t = (node.titles || []).find((x: any) => x.lang === "he" && x.primary)
    || (node.titles || []).find((x: any) => x.lang === "he");
  return t?.text ?? "";
}

function classify(topTitle: string): string {
  const t = topTitle.toLowerCase();
  if (t.includes("shabbat")) return "shabbat";
  if (/(festival|rosh hashana|yom kippur|sukkot|pesach|shavuot|hallel|hoshana)/.test(t)) return "festival";
  if (/(weekday|shacharit|mincha|arvit|maariv)/.test(t)) return "weekday";
  if (/(hanukkah|purim|rosh hodesh|fast|nissan|havdalah|omer|counting|tisha)/.test(t)) return "occasion";
  if (/(preparatory|morning blessings|bedtime|midnight|blessing|meal|grace|birkat|tzitzit|talit|tefillin)/.test(t)) return "daily";
  return "other";
}

const stripHtml = (s: string): string =>
  s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|big)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&thinsp;|&#8201;/g, " ")
    .trim();

function flattenText(t: any, out: string[]): void {
  if (Array.isArray(t)) {
    for (const x of t) flattenText(x, out);
  } else if (typeof t === "string") {
    const clean = stripHtml(t);
    if (clean) out.push(clean);
  }
}

async function fetchHebrew(ref: string): Promise<string> {
  const enc = encodeURIComponent(ref);
  const url = `https://www.sefaria.org/api/v3/texts/${enc}?version=hebrew`;
  const res = await fetch(url, { headers: { "User-Agent": "SephardicBerachotApp/1.0 (content import)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${ref}`);
  const json: any = await res.json();
  const version = (json.versions || [])[0];
  if (!version?.text) return "";
  const lines: string[] = [];
  flattenText(version.text, lines);
  return lines.join("\n");
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

  // First pass: collect all leaves (with their ref path) for progress reporting.
  type Walk = { node: any; path: string[]; parentId: string | null; top: string; order: number };

  async function walk(node: any, ancestors: string[], parentId: string | null, topTitle: string, order: number) {
    const en = enTitle(node);
    const he = heTitle(node);
    const isDefault = node.default === true;
    const titleForPath = isDefault ? null : en;
    const path = titleForPath ? [...ancestors, titleForPath] : ancestors;
    const id = parentId ? `${parentId}/${slugify(en || "default")}` : slugify(en);
    const top = ancestors.length === 0 ? en : topTitle;
    const children = node.nodes as any[] | undefined;
    const isLeaf = !children || children.length === 0;

    const record: SiddurNode = {
      id,
      parentId,
      title: en,
      titleHe: he,
      order,
      isLeaf,
      group: top,
      sectionType: classify(top),
    };

    if (isLeaf) {
      leafCount++;
      const ref = [INDEX_TITLE, ...path].join(", ");
      record.ref = ref;
      try {
        const hebrew = await fetchHebrew(ref);
        record.hebrew = hebrew;
        fetched++;
        if (fetched % 10 === 0) console.log(`  …fetched ${fetched} prayers`);
        await sleep(200);
      } catch (e) {
        failed++;
        record.hebrew = "";
        console.warn(`  ! failed: ${ref} (${(e as Error).message})`);
      }
    }

    nodes.push(record);

    if (children) {
      for (let i = 0; i < children.length; i++) {
        await walk(children[i], path, id, top, i);
      }
    }
  }

  const top = schema.nodes as any[];
  for (let i = 0; i < top.length; i++) {
    await walk(top[i], [], null, "", i);
  }

  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, "siddur.json"), JSON.stringify(nodes, null, 2) + "\n");
  console.log(
    `\n✅ siddur.json written: ${nodes.length} nodes, ${leafCount} prayers (${fetched} fetched, ${failed} failed)`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
