import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.label}>Profile</Text>
      <Text style={styles.sub}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F5F0",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A2B1E",
    letterSpacing: -0.5,
  },
  sub: { fontSize: 14, color: "#1A2B1E", opacity: 0.4, marginTop: 6 },
});
