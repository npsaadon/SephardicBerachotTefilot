export type BerachaType = "rishona" | "acharona";

export interface Beracha {
  key: string;
  nameEn: string;
  nameTranslit: string;
  hebrew: string;
  type: BerachaType;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export type Complexity = "simple" | "note" | "complex" | "ask_rav";

export interface Food {
  slug: string;
  name: string;
  aliases: string[];
  categorySlug: string;
  berachaBefore: string;
  berachaAfter: string | null;
  complexity: Complexity;
  notes: string;
  amountAcharona: string | null;
  timeAcharona: string | null;
  source: string;
  reviewed: boolean;
  minhag: string;
  active: boolean;
}

export interface Tefila {
  slug: string;
  title: string;
  category: string;
  hebrew: string;
  translit: string;
  english: string;
  notes: string;
  whenToSay: string;
  nusach: string;
  source: string;
  reviewed: boolean;
  audioUrl: string | null;
  sortOrder: number;
  active: boolean;
}

export interface SiddurNode {
  id: string;
  parentId: string | null;
  title: string;
  titleHe: string;
  order: number;
  isLeaf: boolean;
  group: string;
  sectionType: string;
  hebrew?: string;
  ref?: string;
}

// Navigation param list
export type RootStackParamList = {
  Home: undefined;
  SearchResults: { query: string };
  FoodDetail: { slug: string };
  Categories: undefined;
  CategoryFoods: { slug: string };
  BerachaAcharona: undefined;
  TefilotList: undefined;
  TefilaReader: { slug: string };
  Favorites: undefined;
  Settings: undefined;
  SiddurIndex: undefined;
  SiddurSection: { id: string; title: string };
  SiddurReader: { id: string };
};
