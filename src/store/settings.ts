import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { apiFetch } from '@/services/api-client';

const secureStorage: StateStorage = {
  getItem: async (name) => await SecureStore.getItemAsync(name) ?? null,
  setItem: async (name, value) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name) => await SecureStore.deleteItemAsync(name),
};

// Requests OS notification permission (if not already granted) and returns
// the Expo push token, or null if permission was denied or this isn't a
// physical device (push tokens aren't available on simulators/emulators).
async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') return null;

  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  return tokenResponse.data;
}

export type Units = 'km' | 'mi';
export type ThemePreference = 'auto' | 'light' | 'dark';
export type NotificationCategory = 'infrastructure' | 'location' | 'weather';

type NotificationPreferencesResponse = {
  preferences?: {
    infrastructureEnabled: boolean;
    locationEnabled: boolean;
    weatherEnabled: boolean;
    quietHoursStart?: string | null;
    quietHoursEnd?: string | null;
    timezone: string;
  };
};

interface SettingsState {
  units: Units;
  searchRadius: number;
  themePreference: ThemePreference;
  notifications: boolean;
  infrastructureNotifications: boolean;
  locationNotifications: boolean;
  weatherNotifications: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  notificationTimezone: string;
  updatedAt: string;
  setUnits: (units: Units) => Promise<void>;
  setSearchRadius: (radius: number) => Promise<void>;
  setThemePreference: (theme: ThemePreference) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  setCategoryNotification: (category: NotificationCategory, enabled: boolean) => Promise<void>;
  setQuietHours: (start?: string, end?: string) => Promise<void>;
  setNotificationTimezone: (timezone: string) => Promise<void>;
  syncNotificationPreferences: () => Promise<void>;
  syncFromBackend: () => Promise<void>;
}

const nextUpdatedAt = (previous: string): string => {
  const now = Date.now();
  const previousMs = Number.isNaN(Date.parse(previous)) ? 0 : Date.parse(previous);
  return new Date(Math.max(now, previousMs + 1)).toISOString();
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      units: 'km',
      searchRadius: 15000,
      themePreference: 'auto',
      notifications: true,
      infrastructureNotifications: true,
      locationNotifications: true,
      weatherNotifications: true,
      quietHoursStart: undefined,
      quietHoursEnd: undefined,
      notificationTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      updatedAt: '1970-01-01T00:00:00.000Z',
      syncNotificationPreferences: async () => {
        try {
          const res = await apiFetch('/notifications/preferences');
          if (!res.ok) return;

          const data = (await res.json()) as NotificationPreferencesResponse;
          const preferences = data.preferences;
          if (!preferences) return;

          set({
            infrastructureNotifications: preferences.infrastructureEnabled,
            locationNotifications: preferences.locationEnabled,
            weatherNotifications: preferences.weatherEnabled,
            quietHoursStart: preferences.quietHoursStart ?? undefined,
            quietHoursEnd: preferences.quietHoursEnd ?? undefined,
            notificationTimezone: preferences.timezone,
          });
        } catch {
          // offline — keep local preferences
        }
      },
      setUnits: async (units) => {
        const previous = get().updatedAt;
        const updatedAt = nextUpdatedAt(previous);
        set({ units, updatedAt });
        await get().syncFromBackend();
      },
      setSearchRadius: async (radius) => {
        const previous = get().updatedAt;
        const updatedAt = nextUpdatedAt(previous);
        set({ searchRadius: radius, updatedAt });
        await get().syncFromBackend();
      },
      setThemePreference: async (themePreference) => {
        const previous = get().updatedAt;
        const updatedAt = nextUpdatedAt(previous);
        set({ themePreference, updatedAt });
        await get().syncFromBackend();
      },
      setNotifications: async (notifications) => {
        if (notifications) {
          const token = await getExpoPushToken();

          if (!token) {
            // Permission denied (or no physical device) — don't claim the
            // toggle is on when we can't actually deliver pushes.
            set({ notifications: false });
            return;
          }

          try {
            await apiFetch('/notifications/device-token', {
              method: 'POST',
              body: JSON.stringify({ token, platform: Platform.OS }),
            });
          } catch {
            // offline — local state still flips on below; registration will
            // need to be retried (e.g. next successful syncFromBackend/app
            // open) since the backend doesn't know about this device yet.
          }
        }
        // Turning notifications off only updates local/backend preference
        // state below — we don't currently unregister the device token.

        const previous = get().updatedAt;
        const updatedAt = nextUpdatedAt(previous);
        set({ notifications, updatedAt });
        await get().syncFromBackend();
      },
      setCategoryNotification: async (category, enabled) => {
        if (category === 'infrastructure') {
          set({ infrastructureNotifications: enabled });
        }
        if (category === 'location') {
          set({ locationNotifications: enabled });
        }
        if (category === 'weather') {
          set({ weatherNotifications: enabled });
        }

        try {
          const state = get();
          await apiFetch('/notifications/preferences', {
            method: 'PUT',
            body: JSON.stringify({
              infrastructureEnabled: state.infrastructureNotifications,
              locationEnabled: state.locationNotifications,
              weatherEnabled: state.weatherNotifications,
              quietHoursStart: state.quietHoursStart,
              quietHoursEnd: state.quietHoursEnd,
              timezone: state.notificationTimezone,
            }),
          });
        } catch {
          // offline — keep local preferences
        }
      },
      setQuietHours: async (start, end) => {
        set({ quietHoursStart: start, quietHoursEnd: end });

        try {
          const state = get();
          await apiFetch('/notifications/preferences', {
            method: 'PUT',
            body: JSON.stringify({
              infrastructureEnabled: state.infrastructureNotifications,
              locationEnabled: state.locationNotifications,
              weatherEnabled: state.weatherNotifications,
              quietHoursStart: state.quietHoursStart,
              quietHoursEnd: state.quietHoursEnd,
              timezone: state.notificationTimezone,
            }),
          });
        } catch {
          // offline — keep local preferences
        }
      },
      setNotificationTimezone: async (timezone) => {
        set({ notificationTimezone: timezone });

        try {
          const state = get();
          await apiFetch('/notifications/preferences', {
            method: 'PUT',
            body: JSON.stringify({
              infrastructureEnabled: state.infrastructureNotifications,
              locationEnabled: state.locationNotifications,
              weatherEnabled: state.weatherNotifications,
              quietHoursStart: state.quietHoursStart,
              quietHoursEnd: state.quietHoursEnd,
              timezone: state.notificationTimezone,
            }),
          });
        } catch {
          // offline — keep local preferences
        }
      },
      syncFromBackend: async () => {
        try {
          const state = get();
          const requestUpdatedAt = state.updatedAt;
          const res = await apiFetch('/settings', {
            method: 'PUT',
            body: JSON.stringify({
              units: state.units,
              searchRadius: state.searchRadius,
              themePreference: state.themePreference,
              notifications: state.notifications,
              updatedAt: state.updatedAt,
            }),
          });
          if (!res.ok) return;
          const data = await res.json();
          const settings = data.settings;
          if (!settings) return;

          const currentUpdatedAtMs = Date.parse(get().updatedAt);
          const requestUpdatedAtMs = Date.parse(requestUpdatedAt);
          if (!Number.isNaN(currentUpdatedAtMs) && !Number.isNaN(requestUpdatedAtMs) && currentUpdatedAtMs > requestUpdatedAtMs) {
            return;
          }

          set({
            units: settings.units,
            searchRadius: settings.searchRadius,
            themePreference: settings.themePreference,
            notifications: settings.notifications,
            updatedAt: settings.updatedAt,
          });

          await get().syncNotificationPreferences();
        } catch {
          // offline — keep local settings
        }
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);