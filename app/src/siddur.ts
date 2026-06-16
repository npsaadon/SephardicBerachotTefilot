import siddurJson from "./data/siddur.json";
import { SiddurNode } from "./types";

export const SIDDUR = siddurJson as SiddurNode[];

const byId = new Map(SIDDUR.map((n) => [n.id, n]));

export const siddurAvailable = (): boolean => SIDDUR.length > 0;

export const getSiddurNode = (id: string): SiddurNode | undefined => byId.get(id);

export const topSections = (): SiddurNode[] =>
  SIDDUR.filter((n) => n.parentId === null).sort((a, b) => a.order - b.order);

export const childrenOf = (id: string): SiddurNode[] =>
  SIDDUR.filter((n) => n.parentId === id).sort((a, b) => a.order - b.order);

export const SECTION_TYPE_LABELS: Record<string, string> = {
  daily: "Daily",
  weekday: "Weekday",
  shabbat: "Shabbat",
  festival: "Festivals",
  occasion: "Occasions",
  other: "More",
};

const SECTION_TYPE_ORDER = ["daily", "weekday", "shabbat", "festival", "occasion", "other"];

/** Top sections grouped by sectionType, in display order. */
export function groupedTopSections(): { type: string; label: string; sections: SiddurNode[] }[] {
  const groups = new Map<string, SiddurNode[]>();
  for (const s of topSections()) {
    (groups.get(s.sectionType) ?? groups.set(s.sectionType, []).get(s.sectionType)!).push(s);
  }
  return SECTION_TYPE_ORDER.filter((t) => groups.has(t)).map((t) => ({
    type: t,
    label: SECTION_TYPE_LABELS[t] ?? t,
    sections: groups.get(t)!,
  }));
}
