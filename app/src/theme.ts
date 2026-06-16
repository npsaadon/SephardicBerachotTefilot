import { Complexity } from "./types";

export const colors = {
  navy: "#1a2b4a",
  gold: "#c9a227",
  blue: "#2e5c8a",
  bg: "#f6f8fb",
  card: "#ffffff",
  border: "#eef1f6",
  muted: "#7b8597",
  chipBg: "#eaf0f8",
  bannerBg: "#fff7e6",
  bannerBorder: "#e8cf8a",
  bannerText: "#8a6d1f",
};

export const complexityMeta: Record<
  Complexity,
  { label: string; showBanner: boolean }
> = {
  simple: { label: "Simple", showBanner: false },
  note: { label: "Note", showBanner: false },
  complex: { label: "Complex", showBanner: true },
  ask_rav: { label: "Ask a Rabbi", showBanner: true },
};
