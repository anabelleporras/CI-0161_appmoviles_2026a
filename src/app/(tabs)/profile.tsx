import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { SESSION_TOKEN_KEY } from "@/app/login";
import { apiFetch } from "@/services/api-client";

interface User {
  id: string;
  email?: string;
  name?: string;
  provider: string;
}

async function handleLogout() {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  router.replace("/login");
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiFetch("/auth/me");
        if (!res.ok) return;
        const data = await res.json();
        setUser(data.user);
      } catch {
        // network error — just show nothing
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={styles.label}>{user?.name ?? "Profile"}</Text>
          <Text style={styles.sub}>{user?.email ?? ""}</Text>
          <Text style={styles.provider}>
            Signed in with {user?.provider ?? ""}
          </Text>
        </>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F5F0",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A2B1E",
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    color: "#1A2B1E",
    opacity: 0.4,
    marginTop: 6,
  },
  provider: {
    fontSize: 12,
    color: "#1A2B1E",
    opacity: 0.3,
    marginTop: 4,
    textTransform: "capitalize",
  },
  logoutButton: {
    marginTop: 32,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: "#1A2B1E",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A2B1E",
  },
});