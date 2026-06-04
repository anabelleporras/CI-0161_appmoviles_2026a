import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';
import { apiFetch } from '@/services/api-client';

const secureStorage: StateStorage = {
  getItem: async (name) => await SecureStore.getItemAsync(name) ?? null,
  setItem: async (name, value) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name) => await SecureStore.deleteItemAsync(name),
};

export type FavoritePlace = {
  placeId: string;
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  types: string[];
  rating?: number;
  photoName?: string;
};

interface FavoritesState {
  favorites: FavoritePlace[];
  isFavorite: (placeId: string) => boolean;
  addFavorite: (place: FavoritePlace) => Promise<void>;
  removeFavorite: (placeId: string) => Promise<void>;
  syncFromBackend: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      isFavorite: (placeId) =>
        get().favorites.some((f) => f.placeId === placeId),

      addFavorite: async (place) => {
        set((state) => ({
          favorites: state.favorites.some((f) => f.placeId === place.placeId)
            ? state.favorites
            : [...state.favorites, place],
        }));
        try {
          await apiFetch('/favorites', {
            method: 'POST',
            body: JSON.stringify(place),
          });
        } catch {
          // stay local
        }
      },

      removeFavorite: async (placeId) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.placeId !== placeId),
        }));
        try {
          await apiFetch(`/favorites/${placeId}`, { method: 'DELETE' });
        } catch {
          // stay local
        }
      },

      syncFromBackend: async () => {
        try {
          const res = await apiFetch('/favorites');
          if (!res.ok) return;
          const data = await res.json();
          const backendFavorites: FavoritePlace[] = data.favorites.map(
            (f: any) => ({
              placeId: f.placeId,
              name: f.name ?? undefined,
              address: f.address ?? undefined,
              lat: f.lat ?? undefined,
              lng: f.lng ?? undefined,
              types: f.types ?? [],
              rating: f.rating ?? undefined,
              photoName: f.photoName ?? undefined,
            })
          );
          set({ favorites: backendFavorites });
        } catch {
          // offline — keep local
        }
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
