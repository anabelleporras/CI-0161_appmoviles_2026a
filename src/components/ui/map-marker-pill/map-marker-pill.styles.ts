import { StyleSheet } from "react-native";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createMapMarkerPillStyles = (theme: Theme) =>
  StyleSheet.create({
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
      paddingHorizontal: Spacing.sm + 2,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.pill,
      backgroundColor: theme.surface,
      ...Shadow.pill,
    },
    pillSelected: {
      backgroundColor: theme.surfaceInverse,
    },
    iconWrap: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
    label: {
      ...Typography.footnote,
      color: theme.textStrong,
      fontWeight: "600",
      maxWidth: 130,
    },
    labelSelected: {
      color: theme.textInverse,
    },
  });
