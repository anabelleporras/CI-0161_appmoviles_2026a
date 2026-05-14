import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createMapStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    map: { ...StyleSheet.absoluteFillObject },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      paddingHorizontal: Spacing.lg,
      gap: Spacing.sm,
    },
    chipsRow: {
      gap: Spacing.sm,
      paddingVertical: Spacing.xs,
      paddingRight: Spacing.lg,
    },
  });
