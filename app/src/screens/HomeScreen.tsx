import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import { searchFoods, getFood } from "../data";
import { getRecentFoodSlugs, useStore } from "../store";
import { FoodRow, SectionLabel, Disclaimer } from "../components";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const TILES = [
  { icon: "🧭", label: "Tefilat HaDerech", go: (n: Props["navigation"]) => n.navigate("TefilaReader", { slug: "tefilat-haderech" }) },
  { icon: "🍽️", label: "Beracha Acharona", go: (n: Props["navigation"]) => n.navigate("BerachaAcharona") },
  { icon: "📖", label: "Common Tefilot", go: (n: Props["navigation"]) => n.navigate("TefilotList") },
  { icon: "🗂️", label: "Categories", go: (n: Props["navigation"]) => n.navigate("Categories") },
];

export default function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  useStore();
  const results = query.trim() ? searchFoods(query) : [];
  const recents = getRecentFoodSlugs()
    .map((s) => getFood(s))
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Sephardic Berachot</Text>
            <Text style={styles.subtitle}>What beracha do I say?</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("Settings")} hitSlop={10}>
            <Text style={styles.gear}>⚙︎</Text>
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search any food…"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10}>
              <Text style={styles.clear}>✕</Text>
            </Pressable>
          )}
        </View>

        {query.trim() ? (
          <View style={{ marginTop: 8 }}>
            {results.length === 0 ? (
              <Text style={styles.empty}>
                No match for “{query}”. Try another name, or browse Categories.
              </Text>
            ) : (
              results.map((f) => (
                <FoodRow
                  key={f.slug}
                  food={f}
                  onPress={() => navigation.navigate("FoodDetail", { slug: f.slug })}
                />
              ))
            )}
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {TILES.map((t) => (
                <Pressable
                  key={t.label}
                  style={styles.tile}
                  onPress={() => t.go(navigation)}
                >
                  <Text style={styles.tileIcon}>{t.icon}</Text>
                  <Text style={styles.tileLabel}>{t.label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.siddurBtn}
              onPress={() => navigation.navigate("SiddurIndex")}
            >
              <Text style={styles.siddurBtnText}>📚  Full Siddur</Text>
              <Text style={styles.siddurBtnSub}>Complete Edot HaMizrach nusach</Text>
            </Pressable>

            <Pressable
              style={styles.favBtn}
              onPress={() => navigation.navigate("Favorites")}
            >
              <Text style={styles.favBtnText}>⭐  Favorites</Text>
            </Pressable>

            {recents.length > 0 && (
              <>
                <SectionLabel>Recent</SectionLabel>
                <View style={styles.chips}>
                  {recents.map((f) => (
                    <Pressable
                      key={f!.slug}
                      style={styles.chip}
                      onPress={() =>
                        navigation.navigate("FoodDetail", { slug: f!.slug })
                      }
                    >
                      <Text style={styles.chipText}>{f!.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Disclaimer style={{ marginTop: 28 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingBottom: 48, maxWidth: 600, width: "100%", alignSelf: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 4 },
  title: { fontSize: 26, fontWeight: "800", color: colors.navy },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4 },
  gear: { fontSize: 22, color: colors.navy, paddingTop: 6 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginTop: 18,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: colors.navy },
  clear: { fontSize: 15, color: colors.muted, paddingHorizontal: 4 },
  empty: { fontSize: 14, color: colors.muted, lineHeight: 20, marginTop: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 16 },
  tile: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 12,
  },
  tileIcon: { fontSize: 26 },
  tileLabel: { fontSize: 14, fontWeight: "700", color: colors.navy, marginTop: 10 },
  siddurBtn: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.gold,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  siddurBtnText: { color: colors.navy, fontSize: 16, fontWeight: "800" },
  siddurBtnSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  favBtn: {
    backgroundColor: colors.navy,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 2,
  },
  favBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: colors.chipBg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { color: colors.blue, fontSize: 13, fontWeight: "600" },
});
