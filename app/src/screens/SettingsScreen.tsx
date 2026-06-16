import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { colors } from "../theme";
import { getSettings, setSetting, useStore } from "../store";
import { FOODS, TEFILOT } from "../data";
import { Disclaimer } from "../components";

export default function SettingsScreen() {
  useStore();
  const settings = getSettings();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <Text style={styles.sectionLabel}>DISPLAY</Text>
      <View style={styles.card}>
        <Row
          label="Show transliteration"
          value={settings.showTranslit}
          onChange={(v) => setSetting("showTranslit", v)}
        />
        <View style={styles.divider} />
        <Row
          label="Show English translation"
          value={settings.showEnglish}
          onChange={(v) => setSetting("showEnglish", v)}
        />
      </View>
      <Text style={styles.hint}>Hebrew is always shown.</Text>

      <Text style={styles.sectionLabel}>ABOUT</Text>
      <View style={styles.card}>
        <Text style={styles.aboutTitle}>Sephardic Berachot</Text>
        <Text style={styles.aboutBody}>
          {FOODS.length} foods and {TEFILOT.length} tefilot, following the Edot
          HaMizrach standard. Works fully offline.
        </Text>
        <Text style={styles.reviewed}>
          Halachic content reviewed by: ____________ (pending)
        </Text>
      </View>

      <Disclaimer style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.blue }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1, color: colors.muted, marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  rowLabel: { fontSize: 15, color: colors.navy },
  divider: { height: 1, backgroundColor: colors.border },
  hint: { fontSize: 12, color: colors.muted, marginTop: 6, marginLeft: 4 },
  aboutTitle: { fontSize: 16, fontWeight: "800", color: colors.navy, paddingTop: 14 },
  aboutBody: { fontSize: 13, color: "#5b6678", lineHeight: 20, marginTop: 6 },
  reviewed: { fontSize: 12, color: colors.muted, marginTop: 12, paddingBottom: 14, fontStyle: "italic" },
});
