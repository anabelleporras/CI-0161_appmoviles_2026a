import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTheme } from "@/hooks/use-theme";

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const styles = useMemo (
      () =>
        StyleSheet.create({
            root: {
              flex: 1,
              backgroundColor: theme.surface,
              alignItems: "center",
              justifyContent: "center",
            },
            label: {
              fontSize: 28,
              fontWeight: "700",
              color: theme.text,
              letterSpacing: -0.5,
            },
            sub: {
              fontSize: 14,
              color: theme.textMuted,
              opacity: 0.4,
              marginTop: 6
            },
        }),
        [theme],
    );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.label}>Trips</Text>
      <Text style={styles.sub}>Coming soon</Text>
    </View>
  );
}
