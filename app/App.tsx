import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "./src/theme";
import { RootStackParamList } from "./src/types";
import { loadStore } from "./src/store";

import HomeScreen from "./src/screens/HomeScreen";
import FoodDetailScreen from "./src/screens/FoodDetailScreen";
import CategoriesScreen from "./src/screens/CategoriesScreen";
import CategoryFoodsScreen from "./src/screens/CategoryFoodsScreen";
import BerachaAcharonaScreen from "./src/screens/BerachaAcharonaScreen";
import TefilotListScreen from "./src/screens/TefilotListScreen";
import TefilaReaderScreen from "./src/screens/TefilaReaderScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import SiddurIndexScreen from "./src/screens/SiddurIndexScreen";
import SiddurSectionScreen from "./src/screens/SiddurSectionScreen";
import SiddurReaderScreen from "./src/screens/SiddurReaderScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.navy },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" as const },
  contentStyle: { backgroundColor: colors.bg },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadStore().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="FoodDetail" component={FoodDetailScreen} options={{ title: "Beracha" }} />
          <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: "Categories" }} />
          <Stack.Screen name="CategoryFoods" component={CategoryFoodsScreen} options={{ title: "Category" }} />
          <Stack.Screen name="BerachaAcharona" component={BerachaAcharonaScreen} options={{ title: "Beracha Acharona" }} />
          <Stack.Screen name="TefilotList" component={TefilotListScreen} options={{ title: "Common Tefilot" }} />
          <Stack.Screen name="TefilaReader" component={TefilaReaderScreen} options={{ title: "Tefila" }} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Favorites" }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
          <Stack.Screen name="SiddurIndex" component={SiddurIndexScreen} options={{ title: "Siddur" }} />
          <Stack.Screen name="SiddurSection" component={SiddurSectionScreen} options={{ title: "Section" }} />
          <Stack.Screen name="SiddurReader" component={SiddurReaderScreen} options={{ title: "Prayer" }} />
          {/* SearchResults route reserved for future use */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
