import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { RootStackParamList, SiddurRun } from "../types";
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

  const content = node.content ?? [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <Text style={styles.title}>{node.title}</Text>
      {node.titleHe ? <Text style={styles.titleHe}>{node.titleHe}</Text> : null}
      <View style={styles.rule} />

      {content.length === 0 ? (
        <Text style={styles.noText}>
          Text for this section isn't available offline yet.
        </Text>
      ) : (
        content.map((line, i) => {
          const isHeader = line.length === 1 && line[0].k === "h";
          if (isHeader) {
            return (
              <Text key={i} style={styles.header}>
                {line[0].s}
              </Text>
            );
          }
          return (
            <Text key={i} style={styles.line}>
              {line.map((run, j) => (
                <Text key={j} style={runStyle(run)}>
                  {run.s}
                </Text>
              ))}
            </Text>
          );
        })
      )}

      <View style={styles.rule} />
      <PendingReview />
      <Text style={styles.source}>Source: Sefaria — Siddur Edot HaMizrach</Text>
    </ScrollView>
  );
}

function runStyle(run: SiddurRun) {
  if (run.k === "i") return styles.instruction;
  if (run.k === "h") return styles.inlineHeader;
  return styles.prayer;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 18, paddingBottom: 72, maxWidth: 700, width: "100%", alignSelf: "center" },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  missingText: { color: colors.muted },
  title: { fontSize: 22, fontWeight: "800", color: colors.navy },
  titleHe: { fontSize: 17, color: colors.gold, marginTop: 2, writingDirection: "rtl", textAlign: "right" },
  rule: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  header: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.gold,
    writingDirection: "rtl",
    textAlign: "center",
    marginTop: 18,
    marginBottom: 6,
  },
  line: { writingDirection: "rtl", textAlign: "right", marginBottom: 10 },
  prayer: { fontSize: 23, lineHeight: 42, color: colors.navy },
  inlineHeader: { fontSize: 20, fontWeight: "800", color: colors.gold, lineHeight: 42 },
  instruction: { fontSize: 14, fontStyle: "italic", color: colors.muted, lineHeight: 34 },
  noText: { fontSize: 14, color: colors.muted, marginTop: 16, lineHeight: 21 },
  source: { fontSize: 11, color: colors.muted, marginTop: 16 },
});
