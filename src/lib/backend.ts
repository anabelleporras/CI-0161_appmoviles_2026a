import { Platform } from "react-native";

const RAW_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL!;

// In development, EXPO_PUBLIC_BACKEND_URL points at 10.0.2.2 — the Android
// emulator's alias for the host machine. The iOS simulator shares the host
// network directly and needs localhost. In production the env var is the
// real hosted URL, so we pass it through untouched.
export const BACKEND_URL =
  __DEV__ && Platform.OS === "ios"
    ? RAW_BACKEND_URL.replace("10.0.2.2", "localhost")
    : RAW_BACKEND_URL;
