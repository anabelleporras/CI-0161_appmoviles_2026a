import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useMemo, useState } from 'react';
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
import IconButton from '@/components/ui/icon-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore, type Units, type ThemePreference } from '@/store/settings';

const UNIT_OPTIONS: { label: string; value: Units }[] = [
  { label: 'km', value: 'km' },
  { label: 'mi', value: 'mi' },
];

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

// "HH:MM" <-> Date helpers. We only ever care about the time-of-day portion,
// so the date component is arbitrary but fixed.
function timeStringToDate(value: string | undefined): Date {
  const base = new Date();
  if (value && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
    const [h, m] = value.split(':').map(Number);
    base.setHours(h, m, 0, 0);
  } else {
    base.setHours(9, 0, 0, 0);
  }
  return base;
}

function dateToTimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatDisplay(value: string | undefined): string {
  if (!value) return 'Not set';
  const [h, m] = value.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const {
    units,
    searchRadius,
    themePreference,
    notifications,
    quietHoursStart,
    quietHoursEnd,
    notificationTimezone,
    setUnits,
    setSearchRadius,
    setThemePreference,
    setNotifications,
    setQuietHours,
  } = useSettingsStore();

  // Which picker is open, if any. iOS renders the picker inline/as a modal
  // sheet; Android's default mode is already a dialog, so we just mount it
  // conditionally and let it dismiss itself.
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

  const handleValueChange = (field: 'start' | 'end') => (date: Date) => {
    commit(field, date);
    if (Platform.OS === 'android') {
      // Android's dialog closes itself after a single confirm tap.
      setOpenPicker(null);
    }
    // iOS spinner stays open and fires continuously while scrolling;
    // commit happens live, dismissal happens when they tap Done.
  };

  const handleDismiss = () => {
    // Fired when the user cancels without picking a value
    // (Android: back button, tap outside, or Cancel button).
    setOpenPicker(null);
  };

  const commit = (field: 'start' | 'end', date: Date) => {
    const value = dateToTimeString(date);
    if (field === 'start') {
      setQuietHours(value, quietHoursEnd);
    } else {
      setQuietHours(quietHoursStart, value);
    }
  };

  const clearQuietHours = () => {
    setOpenPicker(null);
    setQuietHours(undefined, undefined);
  };

  const renderTimeRow = (field: 'start' | 'end') => {
    const value = field === 'start' ? quietHoursStart : quietHoursEnd;
    const label = field === 'start' ? 'Start quiet hours' : 'End quiet hours';

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
              {formatDisplay(value)}
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
              <Text style={styles.iosPickerDoneText}>Done</Text>
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
        <IconButton icon={ArrowLeft} onPress={() => router.back()} accessibilityLabel="Back" />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Units */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Units</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>Distance</Text>
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

        {/* Search radius */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Search radius</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>Nearby places</Text>
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

        {/* Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>Theme</Text>
              <View style={styles.pillGroup}>
                {THEME_OPTIONS.map((opt) => (
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

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Push notifications</Text>
              <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: theme.accent }} />
            </View>

            {renderTimeRow('start')}
            {renderTimeRow('end')}

            {(quietHoursStart || quietHoursEnd) && (
              <View style={[styles.row, { justifyContent: 'flex-end' }]}>
                <Pressable onPress={clearQuietHours}>
                  <Text style={styles.clearLink}>Clear quiet hours</Text>
                </Pressable>
              </View>
            )}

            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>Timezone</Text>
              <Text style={styles.pillText}>{notificationTimezone}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}