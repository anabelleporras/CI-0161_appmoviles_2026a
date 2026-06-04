import { StyleSheet } from "react-native";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createPlaceDetailSheetStyles = (theme: Theme) =>
  StyleSheet.create({
    sheet: {
      position: "absolute",
      left: Spacing.lg,
      right: Spacing.lg,
      bottom: Spacing["5xl"],
      borderRadius: Radius["2xl"],
      backgroundColor: theme.surface,
      padding: Spacing.lg,
      flexDirection: "row",
      gap: Spacing.lg,
      ...Shadow.card,
    },
    thumbnail: {
      width: 76,
      height: 76,
      borderRadius: Radius.md,
    },
    body: {
      flex: 1,
      gap: Spacing.xs,
      justifyContent: "center",
    },
    tag: {
      ...Typography.footnote,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: theme.accent,
    },
    title: {
      ...Typography.subtitle,
      fontWeight: "700",
      color: theme.textStrong,
    },
    meta: {
      ...Typography.caption,
      color: theme.textMuted,
    },
    actions: {
      flexDirection: "row",
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },
    secondaryButton: {
      padding: Spacing.sm + 2,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
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
      textAlign: "center",
    },
  });
