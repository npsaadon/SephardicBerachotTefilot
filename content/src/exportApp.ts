// Exports validated content as JSON the mobile app bundles directly.
// Run: npm run export:app   (from content/)  ->  writes to ../app/src/data/
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateAll } from "./validate";
import { BERACHOT } from "./berachot";
import { CATEGORIES } from "./categories";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "..", "app", "src", "data");

const { foods, tefilot, errors } = validateAll();
if (errors.length) {
  console.error(`refusing to export, content invalid:\n${errors.join("\n")}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const write = (name: string, data: unknown) =>
  writeFileSync(join(outDir, name), JSON.stringify(data, null, 2) + "\n");

write("berachot.json", BERACHOT);
write("categories.json", CATEGORIES);
write("foods.json", foods);
write("tefilot.json", tefilot);

console.log(
  `✅ exported to app/src/data: ${BERACHOT.length} berachot, ${CATEGORIES.length} categories, ${foods.length} foods, ${tefilot.length} tefilot`
);
