import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import { getFood, getTefila } from "../data";
import { getFavoriteIds, useStore } from "../store";
import { FoodRow, SectionLabel } from "../components";

type Props = NativeStackScreenProps<RootStackParamList, "Favorites">;

export default function FavoritesScreen({ navigation }: Props) {
  useStore();
  const ids = getFavoriteIds();
  const foods = ids
    .filter((i) => i.startsWith("food:"))
    .map((i) => getFood(i.slice(5)))
    .filter(Boolean);
  const tefilot = ids
    .filter((i) => i.startsWith("tefila:"))
    .map((i) => getTefila(i.slice(7)))
    .filter(Boolean);

  if (foods.length === 0 && tefilot.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>⭐</Text>
        <Text style={styles.emptyText}>
          No favorites yet. Tap the star on any food or tefila to save it here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      {foods.length > 0 && (
        <>
          <SectionLabel>Foods</SectionLabel>
          {foods.map((f) => (
            <FoodRow
              key={f!.slug}
              food={f!}
              onPress={() => navigation.navigate("FoodDetail", { slug: f!.slug })}
            />
          ))}
        </>
      )}
      {tefilot.length > 0 && (
        <>
          <SectionLabel>Tefilot</SectionLabel>
          {tefilot.map((t) => (
            <Pressable
              key={t!.slug}
              style={styles.row}
              onPress={() => navigation.navigate("TefilaReader", { slug: t!.slug })}
            >
              <Text style={styles.rowName}>{t!.title}</Text>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
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
    padding: 15,
    marginBottom: 10,
  },
  rowName: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.navy },
  arrow: { fontSize: 20, color: colors.gold },
});
