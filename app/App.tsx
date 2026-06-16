import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";

const NAVY = "#1a2b4a";
const GOLD = "#c9a227";
const BLUE = "#2e5c8a";
const BG = "#f6f8fb";
const MUTED = "#7b8597";

type Tile = { icon: string; label: string };
const TILES: Tile[] = [
  { icon: "🧭", label: "Tefilat HaDerech" },
  { icon: "🍽️", label: "Beracha Acharona" },
  { icon: "📖", label: "Common Tefilot" },
  { icon: "🗂️", label: "Categories" },
];

const RECENT = ["Coffee", "Pizza", "Banana", "Apple"];

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Sephardic Berachot</Text>
        <Text style={styles.subtitle}>What beracha do I say?</Text>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search any food…"
            placeholderTextColor={MUTED}
          />
        </View>

        <View style={styles.grid}>
          {TILES.map((t) => (
            <Pressable key={t.label} style={styles.tile}>
              <Text style={styles.tileIcon}>{t.icon}</Text>
              <Text style={styles.tileLabel}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>RECENT</Text>
        <View style={styles.chips}>
          {RECENT.map((r) => (
            <Pressable key={r} style={styles.chip}>
              <Text style={styles.chipText}>{r}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Halachic content follows the Edot HaMizrach standard and is pending
          rabbinic review. For complex cases, ask a qualified rabbi.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  body: {
    padding: 20,
    paddingBottom: 48,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  title: { fontSize: 26, fontWeight: "800", color: NAVY, marginTop: 12 },
  subtitle: { fontSize: 15, color: MUTED, marginTop: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: GOLD,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 18,
    marginBottom: 8,
    shadowColor: NAVY,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: NAVY },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },
  tile: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eef1f6",
    padding: 18,
    marginBottom: 12,
  },
  tileIcon: { fontSize: 26 },
  tileLabel: { fontSize: 14, fontWeight: "700", color: NAVY, marginTop: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: MUTED,
    marginTop: 12,
    marginBottom: 10,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#eaf0f8",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { color: BLUE, fontSize: 13, fontWeight: "600" },
  disclaimer: { fontSize: 12, color: MUTED, lineHeight: 18, marginTop: 28 },
});
