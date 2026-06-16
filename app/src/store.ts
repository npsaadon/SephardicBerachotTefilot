import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const FAV_KEY = "sbt:favorites:v1";
const RECENT_KEY = "sbt:recents:v1";
const SETTINGS_KEY = "sbt:settings:v1";
const RECENT_LIMIT = 12;

type FavId = string; // "food:<slug>" | "tefila:<slug>"

export interface Settings {
  showTranslit: boolean;
  showEnglish: boolean;
}

let favorites: Set<FavId> = new Set();
let recentFoodSlugs: string[] = [];
let settings: Settings = { showTranslit: true, showEnglish: true };
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export async function loadStore(): Promise<void> {
  try {
    const [favRaw, recRaw, setRaw] = await Promise.all([
      AsyncStorage.getItem(FAV_KEY),
      AsyncStorage.getItem(RECENT_KEY),
      AsyncStorage.getItem(SETTINGS_KEY),
    ]);
    if (favRaw) favorites = new Set(JSON.parse(favRaw));
    if (recRaw) recentFoodSlugs = JSON.parse(recRaw);
    if (setRaw) settings = { ...settings, ...JSON.parse(setRaw) };
  } catch {
    // first run / corrupted storage — start fresh
  } finally {
    loaded = true;
    emit();
  }
}

export const favId = (kind: "food" | "tefila", slug: string): FavId =>
  `${kind}:${slug}`;

export const isFavorite = (id: FavId): boolean => favorites.has(id);

export async function toggleFavorite(id: FavId): Promise<void> {
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  emit();
  await AsyncStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
}

export const getFavoriteIds = (): FavId[] => [...favorites];

export const getRecentFoodSlugs = (): string[] => recentFoodSlugs;

export async function addRecentFood(slug: string): Promise<void> {
  recentFoodSlugs = [slug, ...recentFoodSlugs.filter((s) => s !== slug)].slice(
    0,
    RECENT_LIMIT
  );
  emit();
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(recentFoodSlugs));
}

export const getSettings = (): Settings => settings;

export async function setSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<void> {
  settings = { ...settings, [key]: value };
  emit();
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Re-render hook: returns a counter that bumps whenever the store changes. */
export function useStore(): { ready: boolean; version: number } {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const l = () => setVersion((v) => v + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return { ready: loaded, version };
}
