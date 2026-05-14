import { StyleSheet } from "react-native";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

const CARD_WIDTH = 220;
const PHOTO_HEIGHT = 280;

export const createPlaceCardStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      borderRadius: Radius.xl,
      backgroundColor: theme.surface,
      overflow: "hidden",
      ...Shadow.card,
    },
    photo: {
      width: "100%",
      height: PHOTO_HEIGHT,
      borderRadius: Radius.xl,
    },
    badge: {
      position: "absolute",
      top: Spacing.md,
      left: Spacing.md,
      paddingHorizontal: Spacing.sm + 2,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.sm,
      backgroundColor: theme.surface,
    },
    badgeText: {
      ...Typography.footnote,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: theme.textStrong,
    },
    bookmark: {
      position: "absolute",
      top: Spacing.md,
      right: Spacing.md,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface,
    },
    footer: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      gap: 2,
    },
    name: {
      ...Typography.body2,
      color: theme.textStrong,
      fontWeight: "600",
    },
    meta: {
      ...Typography.caption,
      color: theme.textMuted,
    },
  });
