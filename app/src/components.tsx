import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, complexityMeta } from "./theme";
import { Food } from "./types";
import { getBeracha } from "./data";

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children.toUpperCase()}</Text>;
}

export function Disclaimer({ style }: { style?: ViewStyle }) {
  return (
    <Text style={[styles.disclaimer, style]}>
      Halachic content follows the Edot HaMizrach standard and is pending
      rabbinic review. For complex cases, ask a qualified rabbi.
    </Text>
  );
}

export function ComplexityBanner({ kind }: { kind: Food["complexity"] }) {
  if (!complexityMeta[kind].showBanner) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>
        ⚠️ {complexityMeta[kind].label} case — this can depend on amount,
        ingredients, or how it's eaten. Ask a qualified rabbi if unsure.
      </Text>
    </View>
  );
}

export function PendingReview() {
  return <Text style={styles.pending}>⏳ Pending rabbinic review</Text>;
}

// Stable accent color per before-beracha, so the badges are scannable.
const BERACHA_COLOR: Record<string, string> = {
  hamotzi: "#8a5a2b",
  mezonot: "#b5852a",
  haetz: "#2e7d4f",
  haadama: "#3f7d2e",
  hagafen: "#7d2e5c",
  shehakol: "#2e5c8a",
};

export function FoodRow({
  food,
  onPress,
}: {
  food: Food;
  onPress: () => void;
}) {
  const before = getBeracha(food.berachaBefore);
  const complex =
    food.complexity === "complex" || food.complexity === "ask_rav";
  const badgeColor = BERACHA_COLOR[food.berachaBefore] ?? colors.blue;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{food.name}</Text>
        {complex ? <Text style={styles.rowFlag}>⚠ depends — tap for details</Text> : null}
      </View>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={styles.badgeText}>{before?.nameEn ?? "—"}</Text>
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

export function FavStar({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={12}>
      <Text style={[styles.star, active && styles.starOn]}>
        {active ? "★" : "☆"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.muted,
    marginTop: 16,
    marginBottom: 10,
  },
  disclaimer: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  banner: {
    backgroundColor: colors.bannerBg,
    borderWidth: 1,
    borderColor: colors.bannerBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bannerText: { color: colors.bannerText, fontSize: 13, lineHeight: 18 },
  pending: { fontSize: 12, color: colors.muted, marginTop: 8, fontStyle: "italic" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 12,
  },
  rowName: { fontSize: 15, fontWeight: "700", color: colors.navy },
  rowFlag: { fontSize: 11, color: colors.gold, marginTop: 3, fontWeight: "600" },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 8 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  chev: { fontSize: 20, color: colors.muted, marginLeft: 6 },
  star: { fontSize: 24, color: colors.muted },
  starOn: { color: colors.gold },
});
