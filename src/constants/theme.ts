import { Platform } from "react-native";

/**
 * Raw brand palette. We need to replace with the correct values
 */
export const Palette = {
  forest: "#1A2B1E",
  forestActive: "#132017",
  sage400: "#9AAA9A",
  sand: "#F7F5F0",
  cream100: "#F5F0E8",
  beige200: "#E8E5DE",
  white: "#FFFFFF",
  black: "#000000",
} as const;

/**
 * Semantic color tokens. Always read these via `useTheme()` — never reach for
 * Palette in component code.
 */
export const Colors = {
  light: {
    background: Palette.sand,
    surface: Palette.white,
    surfaceMuted: Palette.cream100,
    surfaceInverse: Palette.forest,
    border: Palette.beige200,
    text: Palette.forest,
    textInverse: Palette.sand,
    textMuted: Palette.sage400,
    icon: Palette.forest,
    iconMuted: Palette.sage400,
    tabBarBackground: Palette.cream100,
    tabBarIconActive: Palette.forestActive,
    tabBarIconInactive: Palette.sage400,
  },
  dark: {
    background: Palette.forestActive,
    surface: Palette.forest,
    surfaceMuted: Palette.forestActive,
    surfaceInverse: Palette.sand,
    border: Palette.forest,
    text: Palette.sand,
    textInverse: Palette.forestActive,
    textMuted: Palette.sage400,
    icon: Palette.sand,
    iconMuted: Palette.sage400,
    tabBarBackground: Palette.forest,
    tabBarIconActive: Palette.sand,
    tabBarIconInactive: Palette.sage400,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  "2xl": 28,
  pill: 999,
} as const;

export const Typography = {
  title1: { fontSize: 48, lineHeight: 65, fontWeight: "600", letterSpacing: 0 },
  title2: { fontSize: 40, lineHeight: 54, fontWeight: "600", letterSpacing: 0 },
  title3: { fontSize: 32, lineHeight: 43, fontWeight: "600", letterSpacing: 0 },
  title4: { fontSize: 24, lineHeight: 32, fontWeight: "500", letterSpacing: 0 },
  subtitle: { fontSize: 20, lineHeight: 27, fontWeight: "500", letterSpacing: 0 },
  body1: { fontSize: 20, lineHeight: 27, fontWeight: "400", letterSpacing: 0 },
  body2: { fontSize: 16, lineHeight: 22, fontWeight: "400", letterSpacing: 0 },
  body3: { fontSize: 12, lineHeight: 16, fontWeight: "400", letterSpacing: 0 },
  body4: { fontSize: 10, lineHeight: 14, fontWeight: "400", letterSpacing: 0 },
  label: { fontSize: 18, lineHeight: 24, fontWeight: "500", letterSpacing: 0 },
  caption: { fontSize: 14, lineHeight: 19, fontWeight: "400", letterSpacing: 0 },
  footnote: { fontSize: 10, lineHeight: 14, fontWeight: "400", letterSpacing: 0 },
} as const;

export const Shadow = {
  card: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pill: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  navbar: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
