import { StyleSheet } from "react-native";

import { Radius, Shadow } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

const SIZE = 44;
const BADGE = 10;

export const createIconButtonStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      width: SIZE,
      height: SIZE,
      borderRadius: Radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface,
      ...Shadow.pill,
    },
    ghost: {
      backgroundColor: "transparent",
      shadowOpacity: 0,
      elevation: 0,
    },
    badge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: BADGE,
      height: BADGE,
      borderRadius: BADGE / 2,
      backgroundColor: theme.accent,
      borderWidth: 2,
      borderColor: theme.surface,
    },
  });
