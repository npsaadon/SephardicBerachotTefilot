import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import { childrenOf } from "../siddur";

type Props = NativeStackScreenProps<RootStackParamList, "SiddurSection">;

export default function SiddurSectionScreen({ route, navigation }: Props) {
  const { id, title } = route.params;
  const children = childrenOf(id);

  useEffect(() => {
    navigation.setOptions({ title: title || "Section" });
  }, [title]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      {children.length === 0 ? (
        <Text style={styles.empty}>Nothing here.</Text>
      ) : (
        children.map((c) => (
          <Pressable
            key={c.id}
            style={styles.row}
            onPress={() =>
              c.isLeaf
                ? navigation.navigate("SiddurReader", { id: c.id })
                : navigation.navigate("SiddurSection", { id: c.id, title: c.title })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{c.title}</Text>
              {c.titleHe ? <Text style={styles.he}>{c.titleHe}</Text> : null}
            </View>
            <Text style={styles.arrow}>{c.isLeaf ? "›" : "»"}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  empty: { color: colors.muted, fontSize: 14, marginTop: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  name: { fontSize: 15, fontWeight: "700", color: colors.navy },
  he: { fontSize: 14, color: colors.muted, marginTop: 2, writingDirection: "rtl", textAlign: "left" },
  arrow: { fontSize: 20, color: colors.gold },
});
