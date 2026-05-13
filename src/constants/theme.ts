import { Platform } from "react-native";

/**
 * Brand palette. Four families:
 *  - forestNight    — dark green; light-theme text/cards/buttons + dark-theme background
 *  - ceibaGreen     — bright green; dark-theme text/cards/buttons
 *  - sandWhite      — cream; light-theme background and surfaces
 *  - guanacasteAmber— amber; strong accents (warnings, primary CTAs)
 *
 * Each family exposes interaction states (normal / normalHover / darker /
 * darkerHover). Forest and Ceiba also expose a `text` variant tuned for
 * readability on top of its counterpart background.
 */
export const Palette = {
  forestNight: {
    text: "#2A4A30",
    normal: "#1A2B1E",
    normalHover: "#223726",
    darker: "#111C13",
    darkerHover: "#17261A",
  },
  ceibaGreen: {
    text: "#C8EDD1",
    normal: "#5DC27A",
    normalHover: "#8DD9A0",
    darker: "#3DA65C",
    darkerHover: "#52B870",
  },
  sandWhite: {
    normal: "#F7F5F0",
    normalHover: "#EFECE6",
    darker: "#EDE9E1",
    darkerHover: "#E3DED6",
  },
  guanacasteAmber: {
    normal: "#D47A15",
    normalHover: "#F0B355",
    darker: "#A85E0E",
    darkerHover: "#C96F12",
  },
  white: "#FFFFFF",
  black: "#000000",
} as const;

/**
 * Semantic color tokens. Always read these via `useTheme()` — never reach
 * into Palette from component code.
 */
export const Colors = {
  light: {
    background: Palette.sandWhite.normal,
    surface: Palette.white,
    surfaceMuted: Palette.sandWhite.normalHover,
    surfacePressed: Palette.sandWhite.darker,
    surfaceInverse: Palette.forestNight.normal,
    surfaceInversePressed: Palette.forestNight.normalHover,
    border: Palette.sandWhite.darker,
    text: Palette.forestNight.text,
    textStrong: Palette.forestNight.normal,
    textInverse: Palette.sandWhite.normal,
    textMuted: Palette.forestNight.text,
    icon: Palette.forestNight.normal,
    iconMuted: Palette.forestNight.text,
    tabBarBackground: Palette.sandWhite.darker,
    tabBarIconActive: Palette.forestNight.darker,
    tabBarIconInactive: Palette.forestNight.text,
    accent: Palette.guanacasteAmber.normal,
    accentHover: Palette.guanacasteAmber.normalHover,
    accentStrong: Palette.guanacasteAmber.darker,
    accentStrongHover: Palette.guanacasteAmber.darkerHover,
    textOnAccent: Palette.white,
  },
  dark: {
    background: Palette.forestNight.normal,
    surface: Palette.forestNight.normalHover,
    surfaceMuted: Palette.forestNight.darker,
    surfacePressed: Palette.forestNight.darkerHover,
    surfaceInverse: Palette.sandWhite.normal,
    surfaceInversePressed: Palette.sandWhite.normalHover,
    border: Palette.forestNight.darkerHover,
    text: Palette.ceibaGreen.text,
    textStrong: Palette.ceibaGreen.normalHover,
    textInverse: Palette.forestNight.normal,
    textMuted: Palette.ceibaGreen.darker,
    icon: Palette.ceibaGreen.text,
    iconMuted: Palette.ceibaGreen.darker,
    tabBarBackground: Palette.forestNight.normalHover,
    tabBarIconActive: Palette.ceibaGreen.normal,
    tabBarIconInactive: Palette.ceibaGreen.darker,
    accent: Palette.guanacasteAmber.normal,
    accentHover: Palette.guanacasteAmber.normalHover,
    accentStrong: Palette.guanacasteAmber.darker,
    accentStrongHover: Palette.guanacasteAmber.darkerHover,
    textOnAccent: Palette.white,
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
