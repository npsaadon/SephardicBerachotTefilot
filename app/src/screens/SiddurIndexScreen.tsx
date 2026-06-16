import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import { groupedTopSections, siddurAvailable, childrenOf } from "../siddur";
import { SectionLabel, Disclaimer } from "../components";

type Props = NativeStackScreenProps<RootStackParamList, "SiddurIndex">;

export default function SiddurIndexScreen({ navigation }: Props) {
  if (!siddurAvailable()) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyText}>
          The full siddur is being prepared and will appear here soon.
        </Text>
      </View>
    );
  }

  const groups = groupedTopSections();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <Text style={styles.intro}>
        The complete Siddur Edot HaMizrach. Sourced from Sefaria; Hebrew text.
      </Text>
      {groups.map((g) => (
        <View key={g.type}>
          <SectionLabel>{g.label}</SectionLabel>
          {g.sections.map((s) => (
            <Pressable
              key={s.id}
              style={styles.row}
              onPress={() =>
                navigation.navigate("SiddurSection", { id: s.id, title: s.title })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{s.title}</Text>
                {s.titleHe ? <Text style={styles.he}>{s.titleHe}</Text> : null}
              </View>
              <Text style={styles.count}>{childrenOf(s.id).length}</Text>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <Disclaimer style={{ marginTop: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  intro: { fontSize: 13, color: colors.muted, lineHeight: 19, marginTop: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: colors.bg },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: colors.muted, textAlign: "center", lineHeight: 22 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  name: { fontSize: 15, fontWeight: "700", color: colors.navy },
  he: { fontSize: 14, color: colors.muted, marginTop: 2, writingDirection: "rtl", textAlign: "left" },
  count: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  arrow: { fontSize: 20, color: colors.gold },
});
