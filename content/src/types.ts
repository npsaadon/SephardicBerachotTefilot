export type BerachaType = "rishona" | "acharona";

export interface Beracha {
  key: string;            // stable id, e.g. "haetz"
  nameEn: string;         // "Borei Pri HaEtz"
  nameTranslit: string;   // "Borei peri ha'etz"
  hebrew: string;         // short ending: "בּוֹרֵא פְּרִי הָעֵץ"
  type: BerachaType;
  // Full text you actually recite:
  hebrewFull: string;     // "בָּרוּךְ אַתָּה... בּוֹרֵא פְּרִי הָעֵץ"
  translitFull: string;
  englishFull: string;
  // For long after-blessings (me'ein shalosh / birkat hamazon), link to the
  // full tefila text instead of inlining it.
  tefilaSlug?: string;
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
