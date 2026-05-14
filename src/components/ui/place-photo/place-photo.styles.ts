import { StyleSheet } from "react-native";

import { Radius } from "@/constants/theme";
import type { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

export const createPlacePhotoStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      overflow: "hidden",
      borderRadius: Radius.lg,
      backgroundColor: theme.surfaceMuted,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    fallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceInverse,
    },
  });
