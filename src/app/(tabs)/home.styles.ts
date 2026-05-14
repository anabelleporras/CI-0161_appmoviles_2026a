import { StyleSheet } from "react-native";

import { Spacing, Typography } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createHomeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 120 },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.lg,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },

    sectionSpacer: {
      marginTop: Spacing["2xl"],
    },

    filtersRow: {
      paddingHorizontal: Spacing.xl,
      gap: Spacing.sm,
      paddingBottom: Spacing.md,
    },

    section: {
      paddingHorizontal: Spacing.xl,
      marginTop: Spacing.md,
    },

    loadingContainer: {
      paddingVertical: Spacing["2xl"],
      alignItems: "center",
    },

    emptyState: {
      paddingVertical: Spacing["2xl"],
      alignItems: "center",
    },
    emptyText: {
      ...Typography.body2,
      color: theme.textMuted,
    },

    carouselRow: {
      paddingHorizontal: Spacing.xl,
      gap: Spacing.md,
    },

    bottomSpacer: {
      height: Spacing.xl,
    },
  });
