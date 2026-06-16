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

export function FoodRow({
  food,
  onPress,
}: {
  food: Food;
  onPress: () => void;
}) {
  const before = getBeracha(food.berachaBefore);
  const dot =
    food.complexity === "complex" || food.complexity === "ask_rav"
      ? colors.gold
      : colors.blue;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{food.name}</Text>
        <Text style={styles.rowSub}>{before?.nameEn ?? "—"}</Text>
      </View>
      <Text style={styles.rowHeb}>{before?.hebrew ?? ""}</Text>
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
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowName: { fontSize: 15, fontWeight: "700", color: colors.navy },
  rowSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  rowHeb: { fontSize: 16, color: colors.navy, marginLeft: 8 },
  star: { fontSize: 24, color: colors.muted },
  starOn: { color: colors.gold },
});
