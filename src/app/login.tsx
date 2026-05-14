import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AppleLogo, GoogleLogo } from "@/components/brand-icons";
import { Radius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// 10.0.2.2 is the Android emulator's alias for the host machine. iOS simulator
// shares the host network so it reaches the same backend over localhost.
const BACKEND_URL =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_BACKEND_URL!.replace("10.0.2.2", "localhost")
    : process.env.EXPO_PUBLIC_BACKEND_URL!;
const GOOGLE_CLIENT_ID_WEB = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB!;
const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS!;
const APPLE_AUTH_ENABLED =
  process.env.EXPO_PUBLIC_APPLE_AUTH_ENABLED === "true";

export const SESSION_TOKEN_KEY = "session_token";

GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID_WEB,
  iosClientId: GOOGLE_CLIENT_ID_IOS,
  offlineAccess: false,
});

export default function LoginScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);

  async function handleGoogleLogin() {
    try {
      setLoading("google");

      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error("No ID token returned from Google");
      }

      const name = userInfo.data?.user?.name;

      if (name) {
        await SecureStore.setItemAsync("user_name", name);
      }

      await sendToBackend("google", idToken);
    } catch (error: any) {
      console.error("Google login error:", error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) return;

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
      if (!idToken) throw new Error("No identity token returned from Apple");
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
      const res = await fetch(`${BACKEND_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, idToken }),
      });
      if (!res.ok)
        throw new Error(`Backend responded with status ${res.status}`);
      const data = await res.json();
      await SecureStore.setItemAsync(SESSION_TOKEN_KEY, data.sessionToken);
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Backend error:", error);
      Alert.alert("Login failed", "Could not reach the server.");
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerBlock}>
        <Text style={[styles.welcomeLabel, { color: theme.text }]}>
          WELCOME BACK
        </Text>
        <Text style={[styles.headline, { color: theme.text }]}>
          Let&apos;s get you{"\n"}signed in.
        </Text>
      </View>

      <View style={styles.authBlock}>
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.text }]} />
          <Text style={[styles.dividerText, { color: theme.text }]}>
            LOG IN WITH
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.text }]} />
        </View>

        {APPLE_AUTH_ENABLED && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.surfaceInverse }]}
            onPress={handleAppleLogin}
            disabled={loading !== null}
            activeOpacity={0.88}
            touchSoundDisabled
          >
            {loading === "apple" ? (
              <ActivityIndicator color={theme.textInverse} />
            ) : (
              <>
                <AppleLogo size={20} color={theme.textInverse} />
                <Text
                  style={[styles.buttonLabel, { color: theme.textInverse }]}
                >
                  Continue with Apple
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.surface, borderColor: theme.border },
            styles.googleButton,
          ]}
          onPress={handleGoogleLogin}
          disabled={loading !== null}
          activeOpacity={0.88}
          touchSoundDisabled
        >
          {loading === "google" ? (
            <ActivityIndicator color={theme.text} />
          ) : (
            <>
              <GoogleLogo size={20} />
              <Text style={[styles.buttonLabel, { color: theme.text }]}>
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
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: Spacing["3xl"],
  },
  headerBlock: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: Spacing["2xl"],
  },
  welcomeLabel: {
    ...Typography.footnote,
    fontSize: 11,
    letterSpacing: 2,
    opacity: 0.55,
    marginBottom: 14,
    fontWeight: "500",
  },
  headline: {
    ...Typography.title1,
    fontSize: 44,
    lineHeight: 50,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  authBlock: { gap: Spacing.md },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.15,
  },
  dividerText: {
    fontSize: 11,
    letterSpacing: 1.8,
    opacity: 0.45,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: Radius.pill,
    gap: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  googleButton: {
    borderWidth: 1.5,
  },
});
