import { StyleSheet } from "react-native";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createLocationChipStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.pill,
      backgroundColor: theme.surface,
      alignSelf: "flex-start",
      ...Shadow.pill,
    },
    label: {
      ...Typography.body2,
      color: theme.text,
      fontWeight: "500",
    },
  });
