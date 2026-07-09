import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { apiFetch } from '@/services/api-client';
import i18n, { detectDeviceLanguage, type SupportedLanguage } from '@/lib/i18n';

const secureStorage: StateStorage = {
  getItem: async (name) => await SecureStore.getItemAsync(name) ?? null,
  setItem: async (name, value) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name) => await SecureStore.deleteItemAsync(name),
};

export type Units = 'km' | 'mi';
export type ThemePreference = 'auto' | 'light' | 'dark';
export type Language = 'auto' | SupportedLanguage;

const applyLanguage = (language: Language) => {
  i18n.changeLanguage(language === 'auto' ? detectDeviceLanguage() : language);
};

interface SettingsState {
  units: Units;
  searchRadius: number;
  themePreference: ThemePreference;
  notifications: boolean;
  language: Language;
  updatedAt: string;
  setUnits: (units: Units) => Promise<void>;
  setSearchRadius: (radius: number) => Promise<void>;
  setThemePreference: (theme: ThemePreference) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
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
      language: 'auto',
      updatedAt: '1970-01-01T00:00:00.000Z',
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
        const previous = get().updatedAt;
        const updatedAt = nextUpdatedAt(previous);
        set({ notifications, updatedAt });
        await get().syncFromBackend();
      },
      setLanguage: async (language) => {
        const previous = get().updatedAt;
        const updatedAt = nextUpdatedAt(previous);
        set({ language, updatedAt });
        applyLanguage(language);
        await get().syncFromBackend();
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
              language: state.language,
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
            language: settings.language,
            updatedAt: settings.updatedAt,
          });
          applyLanguage(settings.language);
        } catch {
          // offline — keep local settings
        }
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyLanguage(state.language);
      },
    }
  )
);