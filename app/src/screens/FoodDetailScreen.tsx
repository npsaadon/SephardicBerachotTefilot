import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, complexityMeta } from "../theme";
import { RootStackParamList } from "../types";
import { getBeracha, getCategory, getFood } from "../data";
import {
  addRecentFood,
  favId,
  isFavorite,
  toggleFavorite,
  getSettings,
  useStore,
} from "../store";
import { ComplexityBanner, FavStar, PendingReview } from "../components";

type Props = NativeStackScreenProps<RootStackParamList, "FoodDetail">;

export default function FoodDetailScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  useStore();
  const food = getFood(slug);

  useEffect(() => {
    if (food) addRecentFood(food.slug);
  }, [slug]);

  useEffect(() => {
    navigation.setOptions({ title: food?.name ?? "Not found" });
  }, [food]);

  if (!food) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>This food wasn't found.</Text>
      </View>
    );
  }

  const { showTranslit, showEnglish } = getSettings();
  const before = getBeracha(food.berachaBefore);
  const after = getBeracha(food.berachaAfter);
  const category = getCategory(food.categorySlug);
  const id = favId("food", food.slug);
  const fav = isFavorite(id);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cat}>{category?.name?.toUpperCase() ?? ""}</Text>
          <Text style={styles.name}>{food.name}</Text>
        </View>
        <FavStar active={fav} onPress={() => toggleFavorite(id)} />
      </View>

      <ComplexityBanner kind={food.complexity} />

      <BerachaCard
        label="Before eating"
        accent={colors.gold}
        nameEn={before?.nameEn}
        hebrew={before?.hebrew}
        translit={showTranslit ? before?.nameTranslit : undefined}
      />
      {after ? (
        <BerachaCard
          label="After eating"
          accent={colors.blue}
          nameEn={after.nameEn}
          hebrew={after.hebrew}
          translit={showTranslit ? after.nameTranslit : undefined}
        />
      ) : (
        <View style={styles.noAfter}>
          <Text style={styles.noAfterText}>
            No after-blessing is typically said for this item on its own.
          </Text>
        </View>
      )}

      <View style={styles.meta}>
        {food.amountAcharona && (
          <MetaChip label="Amount" value={food.amountAcharona} />
        )}
        {food.timeAcharona && <MetaChip label="Within" value={food.timeAcharona} />}
        <MetaChip label="Case" value={complexityMeta[food.complexity].label} />
      </View>

      {food.notes ? (
        <View style={styles.noteCard}>
          <Text style={styles.noteHeader}>SEPHARDIC NOTE</Text>
          <Text style={styles.noteBody}>{food.notes}</Text>
        </View>
      ) : null}

      {showEnglish && (before || after) ? (
        <Text style={styles.enLine}>
          {before ? `Before: "${before.nameEn}"` : ""}
          {after ? `   ·   After: "${after.nameEn}"` : ""}
        </Text>
      ) : null}

      {!food.reviewed && <PendingReview />}
    </ScrollView>
  );
}

function BerachaCard({
  label,
  accent,
  nameEn,
  hebrew,
  translit,
}: {
  label: string;
  accent: string;
  nameEn?: string;
  hebrew?: string;
  translit?: string;
}) {
  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <Text style={[styles.cardLabel, { color: accent }]}>
        {label.toUpperCase()}
      </Text>
      <Text style={styles.cardName}>{nameEn ?? "—"}</Text>
      {hebrew ? <Text style={styles.cardHeb}>{hebrew}</Text> : null}
      {translit ? <Text style={styles.cardTr}>{translit}</Text> : null}
    </View>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.mchip}>
      <Text style={styles.mchipLabel}>{label}: </Text>
      <Text style={styles.mchipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 18, paddingBottom: 48, maxWidth: 600, width: "100%", alignSelf: "center" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  missingText: { color: colors.muted },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  cat: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6, color: colors.gold },
  name: { fontSize: 24, fontWeight: "800", color: colors.navy, marginTop: 2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    padding: 15,
    marginBottom: 12,
  },
  cardLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
  cardName: { fontSize: 18, fontWeight: "700", color: colors.navy, marginTop: 4 },
  cardHeb: { fontSize: 24, color: colors.navy, marginTop: 10, writingDirection: "rtl", textAlign: "right", lineHeight: 38 },
  cardTr: { fontSize: 13, fontStyle: "italic", color: colors.muted, marginTop: 6 },
  noAfter: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 15, marginBottom: 12 },
  noAfterText: { color: colors.muted, fontSize: 13 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  mchip: { flexDirection: "row", backgroundColor: colors.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  mchipLabel: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  mchipValue: { fontSize: 11, color: colors.navy, fontWeight: "700" },
  noteCard: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 13 },
  noteHeader: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, color: colors.muted, marginBottom: 5 },
  noteBody: { fontSize: 13, color: "#5b6678", lineHeight: 20 },
  enLine: { fontSize: 13, color: colors.muted, marginTop: 14, lineHeight: 20 },
});
