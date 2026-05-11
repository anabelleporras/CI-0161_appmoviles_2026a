import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL!;
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB!;
const APPLE_AUTH_ENABLED =
    process.env.EXPO_PUBLIC_APPLE_AUTH_ENABLED === "true";

export const SESSION_TOKEN_KEY = "session_token";

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID_WEB,
  offlineAccess: false,
});

// TODO: change font to General Sans and apply sizing?

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <Path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <Path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <Path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </Svg>
  );
}

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

      await SecureStore.setItemAsync(SESSION_TOKEN_KEY, data.sessionToken);

      Alert.alert(
          "Welcome!",
          `Signed in as ${data.user.name}${data.isNewUser ? " (new user)" : ""}`,
      );
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
                      <Text style={styles.appleIcon}></Text>

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
                  <GoogleLogo size={20} />

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

  googleLabel: {
    color: "#1A2B1E",
  },
});