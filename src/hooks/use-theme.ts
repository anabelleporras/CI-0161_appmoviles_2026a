/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/store/settings';

export function useTheme() {
  const systemScheme = useColorScheme();
  const themePreference = useSettingsStore(
    (state) => state.themePreference,
  );

  const theme =
    themePreference === 'auto'
      ? (systemScheme === 'unspecified' ? 'light' : systemScheme)
      : themePreference;

  return Colors[theme];
}