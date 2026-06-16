import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import { TEFILOT } from "../data";
import { SectionLabel } from "../components";

type Props = NativeStackScreenProps<RootStackParamList, "TefilotList">;

export default function TefilotListScreen({ navigation }: Props) {
  const groups = TEFILOT.reduce<Record<string, typeof TEFILOT>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      {Object.entries(groups).map(([category, items]) => (
        <View key={category}>
          <SectionLabel>{category}</SectionLabel>
          {items.map((t) => (
            <Pressable
              key={t.slug}
              style={styles.row}
              onPress={() => navigation.navigate("TefilaReader", { slug: t.slug })}
            >
              <Text style={styles.name}>{t.title}</Text>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 10,
  },
  name: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.navy },
  arrow: { fontSize: 20, color: colors.gold },
});
