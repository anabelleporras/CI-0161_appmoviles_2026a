import { apiFetch } from '@/services/api-client';

export type Timestamped<T> = T & { updatedAt: string };

export async function syncFavoritesWithBackend(localFavorites: any[]) {
  const res = await apiFetch('/favorites/sync', {
    method: 'POST',
    body: JSON.stringify({ favorites: localFavorites }),
  });
  if (!res.ok) throw new Error('Failed to sync favorites');
  return res.json();
}

export async function syncSettingsWithBackend(localSettings: any) {
  const res = await apiFetch('/settings', {
    method: 'PUT',
    body: JSON.stringify(localSettings),
  });
  if (!res.ok) throw new Error('Failed to sync settings');
  return res.json();
}
