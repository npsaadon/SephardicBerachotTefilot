import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import { getTefila } from "../data";
import { favId, isFavorite, toggleFavorite, getSettings, useStore } from "../store";
import { FavStar, PendingReview } from "../components";

type Props = NativeStackScreenProps<RootStackParamList, "TefilaReader">;

export default function TefilaReaderScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  useStore();
  const tefila = getTefila(slug);

  useEffect(() => {
    navigation.setOptions({ title: tefila?.title ?? "Tefila" });
  }, [tefila]);

  if (!tefila) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>This tefila wasn't found.</Text>
      </View>
    );
  }

  const { showTranslit, showEnglish } = getSettings();
  const id = favId("tefila", tefila.slug);
  const fav = isFavorite(id);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cat}>{tefila.category.toUpperCase()}</Text>
          <Text style={styles.title}>{tefila.title}</Text>
        </View>
        <FavStar active={fav} onPress={() => toggleFavorite(id)} />
      </View>

      {tefila.whenToSay ? (
        <View style={styles.whenCard}>
          <Text style={styles.whenLabel}>WHEN TO SAY</Text>
          <Text style={styles.whenText}>{tefila.whenToSay}</Text>
        </View>
      ) : null}

      <Text style={styles.hebrew}>{tefila.hebrew}</Text>

      {showTranslit && tefila.translit ? (
        <Text style={styles.translit}>{tefila.translit}</Text>
      ) : null}

      {showEnglish && tefila.english ? (
        <Text style={styles.english}>{tefila.english}</Text>
      ) : null}

      {tefila.notes ? (
        <View style={styles.noteCard}>
          <Text style={styles.noteHeader}>NOTE</Text>
          <Text style={styles.noteBody}>{tefila.notes}</Text>
        </View>
      ) : null}

      {!tefila.reviewed && <PendingReview />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 18, paddingBottom: 56, maxWidth: 640, width: "100%", alignSelf: "center" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  missingText: { color: colors.muted },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  cat: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6, color: colors.gold },
  title: { fontSize: 24, fontWeight: "800", color: colors.navy, marginTop: 2 },
  whenCard: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 13, marginBottom: 16 },
  whenLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, color: colors.muted, marginBottom: 4 },
  whenText: { fontSize: 13, color: "#5b6678", lineHeight: 19 },
  hebrew: {
    fontSize: 26,
    lineHeight: 46,
    color: colors.navy,
    writingDirection: "rtl",
    textAlign: "right",
  },
  translit: { fontSize: 15, fontStyle: "italic", color: "#5b6678", lineHeight: 24, marginTop: 18 },
  english: { fontSize: 15, color: colors.muted, lineHeight: 24, marginTop: 16 },
  noteCard: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 13, marginTop: 20 },
  noteHeader: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, color: colors.muted, marginBottom: 5 },
  noteBody: { fontSize: 13, color: "#5b6678", lineHeight: 20 },
});
