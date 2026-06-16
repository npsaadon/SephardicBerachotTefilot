import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { Disclaimer } from "../components";

type Section = { title: string; body: string };

const SECTIONS: Section[] = [
  {
    title: "What is a beracha acharona?",
    body: "An after-blessing recited once you have eaten or drunk a required minimum amount. Which one you say depends on what you ate.",
  },
  {
    title: "Borei Nefashot",
    body: "Said after foods whose first blessing is Shehakol or Borei Pri HaAdama (and most drinks) — e.g. meat, fish, eggs, vegetables, candy, water. Requires a kezayit of food, or a revi'it of drink.",
  },
  {
    title: "Al HaMichya (Me'ein Shalosh)",
    body: "Said after foods made from the five grains (wheat, barley, oats, rye, spelt) whose blessing is Mezonot — e.g. cake, cookies, crackers. Requires a kezayit eaten within the time of eating.",
  },
  {
    title: "Al HaGefen",
    body: "Said after drinking a revi'it of wine or grape juice.",
  },
  {
    title: "Al HaEtz",
    body: "Said after eating a kezayit of the five special fruits of the Land of Israel: grapes, figs, pomegranates, olives, and dates.",
  },
  {
    title: "Birkat HaMazon",
    body: "Said after a meal that included bread (Hamotzi). It replaces all other after-blessings for that meal.",
  },
  {
    title: "When no beracha acharona is said",
    body: "If less than the minimum amount (kezayit / revi'it) is eaten or drunk, or if too much time passed, no after-blessing is recited. When in doubt, ask a rabbi.",
  },
  {
    title: "Minimum amounts & time",
    body: "Solid foods: a kezayit (about an olive's bulk), eaten within roughly 4 minutes. Drinks: a revi'it, drunk in the normal manner.",
  },
  {
    title: "Common mistakes",
    body: "Saying Borei Nefashot after mezonot foods (should be Al HaMichya), or forgetting that rice is Mezonot before but Borei Nefashot after.",
  },
];

export default function BerachaAcharonaScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.card}>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.bodyText}>{s.body}</Text>
        </View>
      ))}
      <Disclaimer style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 10,
  },
  title: { fontSize: 15, fontWeight: "800", color: colors.navy, marginBottom: 6 },
  bodyText: { fontSize: 14, color: "#5b6678", lineHeight: 21 },
});
