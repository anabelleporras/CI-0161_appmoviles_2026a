import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { SESSION_TOKEN_KEY } from '@/app/login';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL!;

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401) {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    router.replace('/login');
  }

  return res;
}