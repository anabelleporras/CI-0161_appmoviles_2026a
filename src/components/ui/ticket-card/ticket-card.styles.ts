import { StyleSheet } from "react-native";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

const ICON_SIZE = 44;

export const createTicketCardStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.lg,
      backgroundColor: theme.surface,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      ...Shadow.card,
    },
    iconWrap: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      borderRadius: Radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
    info: { flex: 1, gap: Spacing.xxs },
    name: {
      ...Typography.body1,
      color: theme.text,
      fontWeight: "600",
    },
    meta: { ...Typography.body2, color: theme.textMuted },
    date: { ...Typography.caption, color: theme.textMuted },
  });
