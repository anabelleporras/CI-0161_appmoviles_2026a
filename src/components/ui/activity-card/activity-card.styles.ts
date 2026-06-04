import { StyleSheet } from "react-native";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createActivityCardStyles = (theme: Theme, selected: boolean) =>
  StyleSheet.create({
    card: {
      width: 132,
      borderRadius: Radius["2xl"],
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.md,
      gap: Spacing.sm,
      backgroundColor: selected ? theme.accent : theme.surfaceInverse,
      ...Shadow.card,
    },
    label: {
      ...Typography.subtitle,
      fontWeight: "700",
      letterSpacing: -0.3,
      color: selected ? theme.textOnAccent : theme.textInverse,
    },
    count: {
      ...Typography.caption,
      color: selected ? theme.textOnAccent : theme.textInverse,
      opacity: selected ? 0.85 : 0.7,
    },
  });
