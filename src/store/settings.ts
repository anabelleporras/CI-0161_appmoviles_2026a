import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

const secureStorage: StateStorage = {
  getItem: async (name) => await SecureStore.getItemAsync(name) ?? null,
  setItem: async (name, value) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name) => await SecureStore.deleteItemAsync(name),
};

export type Units = 'km' | 'mi';
export type ThemePreference = 'auto' | 'light' | 'dark';

interface SettingsState {
  units: Units;
  searchRadius: number;
  themePreference: ThemePreference;
  notifications: boolean;
  setUnits: (units: Units) => void;
  setSearchRadius: (radius: number) => void;
  setThemePreference: (theme: ThemePreference) => void;
  setNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      units: 'km',
      searchRadius: 15000,
      themePreference: 'auto',
      notifications: true,
      setUnits: (units) => set({ units }),
      setSearchRadius: (radius) => set({ searchRadius: radius }),
      setThemePreference: (themePreference) => set({ themePreference }),
      setNotifications: (notifications) => set({ notifications }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);