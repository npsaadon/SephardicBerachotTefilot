import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import { getSiddurNode } from "../siddur";
import { PendingReview } from "../components";

type Props = NativeStackScreenProps<RootStackParamList, "SiddurReader">;

export default function SiddurReaderScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const node = getSiddurNode(id);

  useEffect(() => {
    navigation.setOptions({ title: node?.title ?? "Prayer" });
  }, [node]);

  if (!node) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>This prayer wasn't found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <Text style={styles.title}>{node.title}</Text>
      {node.titleHe ? <Text style={styles.titleHe}>{node.titleHe}</Text> : null}

      {node.hebrew ? (
        node.hebrew.split("\n").map((line, i) => (
          <Text key={i} style={styles.hebrew}>
            {line}
          </Text>
        ))
      ) : (
        <Text style={styles.noText}>
          Text for this section isn't available offline yet.
        </Text>
      )}

      <PendingReview />
      <Text style={styles.source}>Source: Sefaria — Siddur Edot HaMizrach</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 18, paddingBottom: 64, maxWidth: 680, width: "100%", alignSelf: "center" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  missingText: { color: colors.muted },
  title: { fontSize: 22, fontWeight: "800", color: colors.navy },
  titleHe: { fontSize: 18, color: colors.gold, marginTop: 2, writingDirection: "rtl", textAlign: "right" },
  hebrew: {
    fontSize: 24,
    lineHeight: 44,
    color: colors.navy,
    writingDirection: "rtl",
    textAlign: "right",
    marginTop: 10,
  },
  noText: { fontSize: 14, color: colors.muted, marginTop: 16, lineHeight: 21 },
  source: { fontSize: 11, color: colors.muted, marginTop: 16 },
});
