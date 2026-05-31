import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { SESSION_TOKEN_KEY } from '@/constants/auth';
import { apiFetch } from '@/services/api-client';

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
      if (!token) return;
      const res = await apiFetch('/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      // no-op: stay logged out
    } finally {
      setIsLoading(false);
    }
  }

  async function login(token: string) {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
    const res = await apiFetch('/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
    router.replace('/(tabs)/home');
  }

  async function logout() {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    setUser(null);
    router.replace('/login');
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}