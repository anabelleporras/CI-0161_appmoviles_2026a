import { StyleSheet } from "react-native";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createFeaturedCardStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      height: 330,
      borderRadius: Radius["2xl"],
      backgroundColor: theme.surfaceInverse,
      overflow: "hidden",
      ...Shadow.card,
    },
    photo: {
      width: "100%",
      height: 130,
      borderRadius: 0,
    },
    body: {
      flex: 1,
      padding: Spacing.lg,
      gap: Spacing.sm,
    },
    tag: {
      ...Typography.footnote,
      fontWeight: "700",
      letterSpacing: 1.4,
      color: theme.accent,
    },
    title: {
      ...Typography.subtitle,
      fontWeight: "700",
      color: theme.textInverse,
      letterSpacing: -0.3,
    },
    meta: {
      ...Typography.caption,
      color: theme.textInverse,
      opacity: 0.7,
    },
    actions: {
      flexDirection: "row",
      gap: Spacing.sm,
      marginTop: "auto",
    },
    primaryButton: {
      flex: 1,
      paddingVertical: Spacing.sm + 2,
      borderRadius: Radius.pill,
      backgroundColor: theme.accent,
      alignItems: "center",
    },
    primaryButtonText: {
      ...Typography.caption,
      fontWeight: "600",
      color: theme.textOnAccent,
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: Spacing.sm + 2,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: theme.textInverse,
      alignItems: "center",
    },
    secondaryButtonText: {
      ...Typography.caption,
      fontWeight: "600",
      color: theme.textInverse,
    },
  });
