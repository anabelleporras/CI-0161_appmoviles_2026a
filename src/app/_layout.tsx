import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { View, ActivityIndicator } from "react-native";

import { BACKEND_URL } from "@/lib/backend";

import { SESSION_TOKEN_KEY } from "./login";

export default function RootLayout() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);

        if (!token) {
          router.replace("/login");
          return;
        }

        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          router.replace("/(tabs)/home");
        } else {
          await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    }

    restoreSession();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}