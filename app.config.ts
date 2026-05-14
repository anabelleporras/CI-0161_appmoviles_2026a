import type { ExpoConfig } from "expo/config";

const googleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_PLATFORM_API_KEY ?? "";

const config: ExpoConfig = {
  name: "CI-0161_appmoviles_2026a",
  slug: "CI-0161_appmoviles_2026a",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "ci0161appmoviles2026a",
  userInterfaceStyle: "automatic",

  ios: {
    icon: "./assets/expo.icon",
    bundleIdentifier: "com.ci0161.appmoviles2026a",
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "We use your location to show nearby beaches, parks, and places.",
      LSApplicationQueriesSchemes: ["comgooglemaps", "googlechromes"],
    },
  },

  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    package: "com.ci0161.appmoviles2026a",
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
    ],
    intentFilters: [
      {
        action: "VIEW",
        data: [
          { scheme: "ci0161appmoviles2026a" },
          {
            scheme:
              "com.googleusercontent.apps.1047179573348-6ldp2q7q9589qfcrf0t579c8ien92617",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },

  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        android: {
          image: "./assets/images/splash-icon.png",
          imageWidth: 76,
        },
      },
    ],
    "expo-secure-store",
    "@react-native-google-signin/google-signin",
    "expo-web-browser",
    [
      "react-native-maps",
      {
        iosGoogleMapsApiKey: googleMapsApiKey,
        androidGoogleMapsApiKey: googleMapsApiKey,
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
