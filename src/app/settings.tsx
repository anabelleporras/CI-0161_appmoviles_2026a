import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
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

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const {
    units,
    searchRadius,
    themePreference,
    notifications,
    setUnits,
    setSearchRadius,
    setThemePreference,
    setNotifications,
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
        backBtn: {
          width: 40,
          height: 40,
          borderRadius: Radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.border,
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
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        >
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>Theme</Text>
              <View style={styles.pillGroup}>
                {THEME_OPTIONS.map((opt) => (
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

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.card}>
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>Push notifications</Text>
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