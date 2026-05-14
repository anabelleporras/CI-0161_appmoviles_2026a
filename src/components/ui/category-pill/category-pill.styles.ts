import { StyleSheet } from "react-native";

import { Radius, Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createCategoryPillStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm + 2,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    baseSelected: {
      backgroundColor: theme.surfaceInverse,
      borderColor: theme.surfaceInverse,
    },
    compact: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs + 2,
      gap: Spacing.xs,
    },
    label: {
      ...Typography.body2,
      color: theme.text,
      fontWeight: "500",
    },
    labelSelected: {
      color: theme.textInverse,
    },
    labelCompact: {
      ...Typography.caption,
      fontWeight: "500",
    },
  });
