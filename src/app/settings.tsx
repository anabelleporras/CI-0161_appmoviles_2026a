import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconButton from '@/components/ui/icon-button';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore, type Units, type ThemePreference, type Language } from '@/store/settings';

const UNIT_OPTIONS: { label: string; value: Units }[] = [
  { label: 'km', value: 'km' },
  { label: 'mi', value: 'mi' },
];

function normalizeLanguageSelection(value: string | null | undefined): Language {
  const lower = (value ?? 'auto').toLowerCase();
  if (lower === 'auto') return 'auto';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('es')) return 'es';
  return 'auto';
}

function timeStringToDate(value: string | undefined): Date {
  const base = new Date();
  if (value && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
    const [hours, minutes] = value.split(':').map(Number);
    base.setHours(hours, minutes, 0, 0);
  } else {
    base.setHours(9, 0, 0, 0);
  }
  return base;
}

function dateToTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDisplay(value: string): string {
  const [hours, minutes] = value.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

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
    quietHoursStart,
    quietHoursEnd,
    notificationTimezone,
    setUnits,
    setSearchRadius,
    setThemePreference,
    setNotifications,
    setLanguage,
    setQuietHours,
  } = useSettingsStore();
  const [openPicker, setOpenPicker] = useState<'start' | 'end' | null>(null);

  const radiusOptions = useMemo(
    () => [
      { value: 5000, label: units === 'mi' ? '3 mi' : '5 km' },
      { value: 10000, label: units === 'mi' ? '6 mi' : '10 km' },
      { value: 15000, label: units === 'mi' ? '9 mi' : '15 km' },
      { value: 30000, label: units === 'mi' ? '19 mi' : '30 km' },
      { value: 50000, label: units === 'mi' ? '31 mi' : '50 km' },
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

  const selectedLanguage = useMemo(() => normalizeLanguageSelection(language), [language]);

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
        radiusList: { gap: Spacing.xs },
        headerTitle: { ...Typography.subtitle, color: theme.text, fontWeight: '700' },
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
        rowLast: { borderBottomWidth: 0 },
        rowLabel: { ...Typography.body2, color: theme.text },
        rowValue: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
        },
        pillGroup: { flexDirection: 'row', gap: Spacing.xs },
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
        pillText: { ...Typography.body3, color: theme.textMuted, fontWeight: '500' },
        pillTextActive: { color: theme.textInverse },
        timeValue: {
          ...Typography.body2,
          color: theme.text,
        },
        timePlaceholder: {
          color: theme.textMuted,
        },
        clearLink: {
          ...Typography.body3,
          color: theme.textMuted,
          textDecorationLine: 'underline',
        },
        iosPickerWrap: {
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.sm,
          alignItems: 'center',
        },
        iosPickerDone: {
          alignSelf: 'flex-end',
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.md,
        },
        iosPickerDoneText: {
          ...Typography.body2,
          color: theme.accentStrong,
          fontWeight: '600',
        },
      }),
    [theme],
  );

  const commit = (field: 'start' | 'end', date: Date) => {
    const value = dateToTimeString(date);
    if (field === 'start') {
      setQuietHours(value, quietHoursEnd);
    } else {
      setQuietHours(quietHoursStart, value);
    }
  };

  const handleValueChange = (field: 'start' | 'end') => (date: Date) => {
    commit(field, date);
    if (Platform.OS === 'android') {
      setOpenPicker(null);
    }
  };

  const handleDismiss = () => {
    setOpenPicker(null);
  };

  const clearQuietHours = () => {
    setOpenPicker(null);
    setQuietHours(undefined, undefined);
  };

  const renderTimeRow = (field: 'start' | 'end') => {
    const value = field === 'start' ? quietHoursStart : quietHoursEnd;
    const label = field === 'start'
      ? t('settings.startQuietHours')
      : t('settings.endQuietHours');

    return (
      <>
        <Pressable
          style={styles.row}
          disabled={!notifications}
          onPress={() => setOpenPicker(openPicker === field ? null : field)}
        >
          <Text style={styles.rowLabel}>{label}</Text>
          <View style={styles.rowValue}>
            <Text style={[styles.timeValue, !value && styles.timePlaceholder]}>
              {value ? formatDisplay(value) : t('settings.notSet')}
            </Text>
          </View>
        </Pressable>

        {openPicker === field && Platform.OS === 'ios' && (
          <View style={styles.iosPickerWrap}>
            <DateTimePicker
              value={timeStringToDate(value)}
              mode="time"
              display="spinner"
              onValueChange={handleValueChange(field)}
              onDismiss={handleDismiss}
              themeVariant={theme.scheme === 'dark' ? 'dark' : 'light'}
            />
            <Pressable style={styles.iosPickerDone} onPress={() => setOpenPicker(null)}>
              <Text style={styles.iosPickerDoneText}>{t('common.done')}</Text>
            </Pressable>
          </View>
        )}

        {openPicker === field && Platform.OS === 'android' && (
          <DateTimePicker
            value={timeStringToDate(value)}
            mode="time"
            display="default"
            onValueChange={handleValueChange(field)}
            onDismiss={handleDismiss}
          />
        )}
      </>
    );
  };

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
        keyboardShouldPersistTaps="handled"
      >
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
                    <Text style={[styles.pillText, units === opt.value && styles.pillTextActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

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
                      style={[styles.pill, searchRadius === item.value && styles.pillActive]}
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.appearance')}</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>{t('settings.theme')}</Text>
              <View style={styles.pillGroup}>
                {themeOptions.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.pill, themePreference === opt.value && styles.pillActive]}
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>{t('settings.appLanguage')}</Text>
              <View style={{ flex: 1, marginLeft: Spacing.xs }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.radiusList}
                >
                  {languageOptions.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.pill, selectedLanguage === opt.value && styles.pillActive]}
                      onPress={() => setLanguage(opt.value)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          selectedLanguage === opt.value && styles.pillTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.notifications')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('settings.pushNotifications')}</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: theme.accent }}
              />
            </View>

            {renderTimeRow('start')}
            {renderTimeRow('end')}

            {(quietHoursStart || quietHoursEnd) && (
              <View style={[styles.row, { justifyContent: 'flex-end' }]}>
                <Pressable onPress={clearQuietHours}>
                  <Text style={styles.clearLink}>{t('settings.clearQuietHours')}</Text>
                </Pressable>
              </View>
            )}

            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>{t('settings.timezone')}</Text>
              <Text style={styles.pillText}>{notificationTimezone}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}