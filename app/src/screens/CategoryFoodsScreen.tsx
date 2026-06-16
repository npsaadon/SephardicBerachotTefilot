import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { RootStackParamList } from "../types";
import { foodsInCategory, getCategory } from "../data";
import { FoodRow } from "../components";

type Props = NativeStackScreenProps<RootStackParamList, "CategoryFoods">;

export default function CategoryFoodsScreen({ route, navigation }: Props) {
  const { slug } = route.params;
  const category = getCategory(slug);
  const foods = foodsInCategory(slug);

  useEffect(() => {
    navigation.setOptions({ title: category?.name ?? "Category" });
  }, [slug]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      {foods.length === 0 ? (
        <Text style={styles.empty}>No foods in this category yet.</Text>
      ) : (
        foods.map((f) => (
          <FoodRow
            key={f.slug}
            food={f}
            onPress={() => navigation.navigate("FoodDetail", { slug: f.slug })}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  empty: { color: colors.muted, fontSize: 14, marginTop: 12 },
});
