import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import { CATEGORIES, categoryCount } from "../data";

type Props = NativeStackScreenProps<RootStackParamList, "Categories">;

export default function CategoriesScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      {CATEGORIES.map((c) => (
        <Pressable
          key={c.slug}
          style={styles.row}
          onPress={() => navigation.navigate("CategoryFoods", { slug: c.slug })}
        >
          <Text style={styles.icon}>{c.icon}</Text>
          <Text style={styles.name}>{c.name}</Text>
          <Text style={styles.count}>{categoryCount(c.slug)}</Text>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
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
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  icon: { fontSize: 22, width: 28, textAlign: "center" },
  name: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.navy },
  count: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  arrow: { fontSize: 20, color: colors.gold },
});
