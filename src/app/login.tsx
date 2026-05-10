import * as AppleAuthentication from "expo-apple-authentication";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL!;
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB!;
const APPLE_AUTH_ENABLED =
  process.env.EXPO_PUBLIC_APPLE_AUTH_ENABLED === "true";

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID_WEB,
  offlineAccess: false,
});

export default function LoginScreen() {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);

  async function handleGoogleLogin() {
    try {
      setLoading("google");

      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      console.log("GOOGLE USER:", userInfo);

      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error("No ID token returned from Google");
      }

      await sendToBackend("google", idToken);
    } catch (error: any) {
      console.error("Google login error:", error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }

      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          "Google Play Services missing",
          "Google Play Services are required on this device.",
        );

        return;
      }

      Alert.alert("Login failed", "Could not complete Google sign-in.");
    } finally {
      setLoading(null);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // APPLE LOGIN 😵
  // ───────────────────────────────────────────────────────────────────────────
  async function handleAppleLogin() {
    try {
      setLoading("apple");

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const idToken = credential.identityToken;

      if (!idToken) {
        throw new Error("No identity token returned from Apple");
      }

      await sendToBackend("apple", idToken);
    } catch (error: any) {
      if (error.code !== "ERR_REQUEST_CANCELED") {
        console.error("Apple login error:", error);

        Alert.alert("Login failed", "Could not complete Apple sign-in.");
      }
    } finally {
      setLoading(null);
    }
  }

  async function sendToBackend(provider: "google" | "apple", idToken: string) {
    try {
      console.log("Sending token to backend...");
      console.log("BACKEND URL:", BACKEND_URL);

      const res = await fetch(`${BACKEND_URL}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          idToken,
        }),
      });

      if (!res.ok) {
        throw new Error(`Backend responded with status ${res.status}`);
      }

      const data = await res.json();

      console.log("AUTH SUCCESS:", data);

      Alert.alert(
        "Welcome!",
        `Signed in as ${data.user.name}${data.isNewUser ? " (new user)" : ""}`,
      );

      // TODO: save sessionToken
    } catch (error) {
      console.error("Backend error:", error);

      Alert.alert("Login failed", "Could not reach the server.");
    }
  }

  // TODO: change to a proper screen layout with header, spacing, etc. This is just a quick mockup to get the auth flow working.
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.welcomeLabel}>WELCOME BACK</Text>

        <Text style={styles.headline}>Let's get you{"\n"}signed in.</Text>
      </View>

      {/* Auth buttons */}
      <View style={styles.authBlock}>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>LOG IN WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Apple */}
        {APPLE_AUTH_ENABLED && (
          <TouchableOpacity
            style={[styles.button, styles.appleButton]}
            onPress={handleAppleLogin}
            disabled={loading !== null}
            activeOpacity={0.88}
          >
            {loading === "apple" ? (
              <ActivityIndicator color="#F7F5F0" />
            ) : (
              <>
                <Text style={styles.appleIcon}></Text>

                <Text style={[styles.buttonLabel, styles.appleLabel]}>
                  Continue with Apple
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Google */}
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleLogin}
          disabled={loading !== null}
          activeOpacity={0.88}
        >
          {loading === "google" ? (
            <ActivityIndicator color="#1A2B1E" />
          ) : (
            <>
              <Text style={styles.googleG}>
                <Text style={{ color: "#4285F4" }}>G</Text>
              </Text>

              <Text style={[styles.buttonLabel, styles.googleLabel]}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5F0",
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 48,
  },

  headerBlock: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 32,
  },

  welcomeLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: "#1A2B1E",
    opacity: 0.55,
    marginBottom: 14,
    fontWeight: "500",
  },

  headline: {
    fontSize: 44,
    fontWeight: "700",
    color: "#1A2B1E",
    lineHeight: 50,
    letterSpacing: -0.5,
  },

  authBlock: {
    gap: 12,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 10,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1A2B1E",
    opacity: 0.15,
  },

  dividerText: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: "#1A2B1E",
    opacity: 0.45,
    fontWeight: "500",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 100,
    gap: 10,
  },

  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },

  appleButton: {
    backgroundColor: "#1A2B1E",
  },

  appleIcon: {
    fontSize: 20,
    color: "#F7F5F0",
    lineHeight: 24,
  },

  appleLabel: {
    color: "#F7F5F0",
  },

  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E8E5DE",
  },

  googleG: {
    fontSize: 18,
    fontWeight: "700",
  },

  googleLabel: {
    color: "#1A2B1E",
  },
});
