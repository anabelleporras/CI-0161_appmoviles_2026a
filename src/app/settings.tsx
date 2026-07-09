import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import IconButton from '@/components/ui/icon-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore, type Units, type ThemePreference, type Language } from '@/store/settings';

const UNIT_OPTIONS: { label: string; value: Units }[] = [
  { label: 'km', value: 'km' },
  { label: 'mi', value: 'mi' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    units,
    searchRadius,
    themePreference,
    notifications,
    language,
    setUnits,
    setSearchRadius,
    setThemePreference,
    setNotifications,
    setLanguage,
  } = useSettingsStore();

  const radiusOptions = useMemo(
    () => [
      {
        value: 5000,
        label: units === 'mi' ? '3 mi' : '5 km',
      },
      {
        value: 10000,
        label: units === 'mi' ? '6 mi' : '10 km',
      },
      {
        value: 15000,
        label: units === 'mi' ? '9 mi' : '15 km',
      },
      {
        value: 30000,
        label: units === 'mi' ? '19 mi' : '30 km',
      },
      {
        value: 50000,
        label: units === 'mi' ? '31 mi' : '50 km',
      },
    ],
    [units],
  );

  const themeOptions = useMemo<{ label: string; value: ThemePreference }[]>(
    () => [
      { label: t('settings.themeAuto'), value: 'auto' },
      { label: t('settings.themeLight'), value: 'light' },
      { label: t('settings.themeDark'), value: 'dark' },
    ],
    [t],
  );

  const languageOptions = useMemo<{ label: string; value: Language }[]>(
    () => [
      { label: t('settings.languageAuto'), value: 'auto' },
      { label: t('settings.languageEnglish'), value: 'en' },
      { label: t('settings.languageSpanish'), value: 'es' },
    ],
    [t],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.background },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.md,
        },
        radiusList: {
          gap: Spacing.xs,
        },
        headerTitle: {
          ...Typography.subtitle,
          color: theme.text,
          fontWeight: '700',
        },
        content: {
          paddingHorizontal: Spacing.xl,
          gap: Spacing.xl,
          paddingBottom: 120,
        },
        section: { gap: Spacing.sm },
        sectionLabel: {
          ...Typography.footnote,
          color: theme.textMuted,
          letterSpacing: 1.5,
          fontWeight: '500',
          textTransform: 'uppercase',
          marginBottom: Spacing.xs,
        },
        card: {
          backgroundColor: theme.surface,
          borderRadius: Radius.lg,
          overflow: 'hidden',
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        rowLast: {
          borderBottomWidth: 0,
        },
        rowLabel: {
          ...Typography.body2,
          color: theme.text,
          //flex: 1,
        },
        pillGroup: {
          flexDirection: 'row',
          gap: Spacing.xs,
        },
        pill: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.xs,
          borderRadius: Radius.pill,
          borderWidth: 1,
          borderColor: theme.border,
        },
        pillActive: {
          backgroundColor: theme.surfaceInverse,
          borderColor: theme.surfaceInverse,
        },
        pillText: {
          ...Typography.body3,
          color: theme.textMuted,
          fontWeight: '500',
        },
        pillTextActive: {
          color: theme.textInverse,
        },
      }),
    [theme],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          onPress={() => router.back()}
          accessibilityLabel={t('common.back')}
        />
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Units */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.units')}</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>{t('settings.distance')}</Text>
              <View style={styles.pillGroup}>
                {UNIT_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.pill, units === opt.value && styles.pillActive]}
                    onPress={() => setUnits(opt.value)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        units === opt.value && styles.pillTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Search radius */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.searchRadius')}</Text>
          <View style={styles.card}>
              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>{t('settings.nearbyPlaces')}</Text>
                <View style={{ flex: 1, marginLeft: Spacing.xs }}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.radiusList}
                  >
                    {radiusOptions.map((item) => (
                      <Pressable
                        key={item.value}
                        style={[
                          styles.pill,
                          searchRadius === item.value && styles.pillActive,
                        ]}
                        onPress={() => setSearchRadius(item.value)}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            searchRadius === item.value && styles.pillTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
              </View>
            </View>
          </View>
        </View>

        {/* Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.appearance')}</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>{t('settings.theme')}</Text>
              <View style={styles.pillGroup}>
                {themeOptions.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.pill,
                      themePreference === opt.value && styles.pillActive,
                    ]}
                    onPress={() => setThemePreference(opt.value)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        themePreference === opt.value && styles.pillTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>{t('settings.appLanguage')}</Text>
              <View style={styles.pillGroup}>
                {languageOptions.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.pill,
                      language === opt.value && styles.pillActive,
                    ]}
                    onPress={() => setLanguage(opt.value)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        language === opt.value && styles.pillTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.notifications')}</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>{t('settings.pushNotifications')}</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: theme.accent }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
