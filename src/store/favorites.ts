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

export type FavoriteSyncEntry = FavoritePlace & {
  updatedAt: string;
  deletedAt?: string;
};

interface FavoritesState {
  favorites: FavoritePlace[];
  pendingSync: FavoriteSyncEntry[];
  isFavorite: (placeId: string) => boolean;
  addFavorite: (place: FavoritePlace) => Promise<void>;
  removeFavorite: (placeId: string) => Promise<void>;
  syncFromBackend: () => Promise<void>;
}

const createSyncEntry = (
  place: FavoritePlace,
  deleted: boolean = false,
  updatedAt?: string,
): FavoriteSyncEntry => ({
  ...place,
  updatedAt: updatedAt ?? new Date().toISOString(),
  deletedAt: deleted ? new Date().toISOString() : undefined,
});

const mergeSyncEntry = (
  queue: FavoriteSyncEntry[],
  entry: FavoriteSyncEntry,
): FavoriteSyncEntry[] => [
  ...queue.filter((item) => item.placeId !== entry.placeId),
  entry,
];

const mapBackendFavorite = (f: any): FavoritePlace => ({
  placeId: f.placeId,
  name: f.name ?? undefined,
  address: f.address ?? undefined,
  lat: f.lat ?? undefined,
  lng: f.lng ?? undefined,
  types: f.types ?? [],
  rating: f.rating ?? undefined,
  photoName: f.photoName ?? undefined,
});

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      pendingSync: [],

      isFavorite: (placeId) =>
        get().favorites.some((f) => f.placeId === placeId),

      addFavorite: async (place) => {
        const entry = createSyncEntry(place, false);
        set((state) => ({
          favorites: state.favorites.some((f) => f.placeId === place.placeId)
            ? state.favorites
            : [...state.favorites, place],
          pendingSync: mergeSyncEntry(state.pendingSync, entry),
        }));

        try {
          const res = await apiFetch('/favorites', {
            method: 'POST',
            body: JSON.stringify(place),
          });
          if (res.ok) {
            set((state) => ({
              pendingSync: state.pendingSync.filter((item) => item.placeId !== place.placeId),
            }));
          }
        } catch {
          // stay local until next sync
        }
      },

      removeFavorite: async (placeId) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.placeId !== placeId),
          pendingSync: mergeSyncEntry(
            state.pendingSync,
            createSyncEntry(
              {
                placeId,
                types: [],
              } as FavoritePlace,
              true,
            ),
          ),
        }));

        try {
          const res = await apiFetch(`/favorites/${placeId}`, { method: 'DELETE' });
          if (res.ok) {
            set((state) => ({
              pendingSync: state.pendingSync.filter((item) => item.placeId !== placeId),
            }));
          }
        } catch {
          // stay local until next sync
        }
      },

      syncFromBackend: async () => {
        try {
          const pendingChanges = get().pendingSync;
          if (pendingChanges.length > 0) {
            const res = await apiFetch('/favorites/sync', {
              method: 'POST',
              body: JSON.stringify({ favorites: pendingChanges }),
            });
            if (!res.ok) return;
            const data = await res.json();
            const backendFavorites: FavoritePlace[] = data.favorites.map(mapBackendFavorite);
            set({ favorites: backendFavorites, pendingSync: [] });
            return;
          }

          const res = await apiFetch('/favorites');
          if (!res.ok) return;
          const data = await res.json();
          const backendFavorites: FavoritePlace[] = data.favorites.map(mapBackendFavorite);
          set({ favorites: backendFavorites });
        } catch {
          // offline — keep local state
        }
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
