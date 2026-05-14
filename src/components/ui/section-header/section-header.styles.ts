import { StyleSheet } from "react-native";

import { Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createSectionHeaderStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.xl,
      marginBottom: Spacing.md,
    },
    title: {
      ...Typography.title4,
      color: theme.textStrong,
      fontWeight: "600",
    },
    action: {
      ...Typography.body2,
      color: theme.textMuted,
      fontWeight: "500",
    },
  });
