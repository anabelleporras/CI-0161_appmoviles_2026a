import { StyleSheet } from "react-native";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createFeaturedCardStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: Radius["2xl"],
      backgroundColor: theme.surfaceInverse,
      overflow: "hidden",
      ...Shadow.card,
    },
    photo: {
      width: "100%",
      height: 180,
      borderRadius: 0,
    },
    body: {
      padding: Spacing.xl,
      gap: Spacing.md,
    },
    tag: {
      ...Typography.footnote,
      fontWeight: "700",
      letterSpacing: 1.4,
      color: theme.accent,
    },
    title: {
      ...Typography.title3,
      fontWeight: "700",
      color: theme.textInverse,
      letterSpacing: -0.5,
    },
    meta: {
      ...Typography.body2,
      color: theme.textInverse,
      opacity: 0.7,
    },
    actions: {
      flexDirection: "row",
      gap: Spacing.md,
      marginTop: Spacing.sm,
    },
    primaryButton: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: Radius.pill,
      backgroundColor: theme.accent,
      alignItems: "center",
    },
    primaryButtonText: {
      ...Typography.body2,
      fontWeight: "600",
      color: theme.textOnAccent,
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: Spacing.md,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: theme.textInverse,
      alignItems: "center",
    },
    secondaryButtonText: {
      ...Typography.body2,
      fontWeight: "600",
      color: theme.textInverse,
    },
  });
