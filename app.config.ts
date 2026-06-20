import type { ExpoConfig } from "expo/config";

const googleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_PLATFORM_API_KEY ?? "";

const iosClientId =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS ??
  "1047179573348-9jjq6un9eqvn3e153tueplbhr4lqmp2e.apps.googleusercontent.com";
const iosUrlScheme = `com.googleusercontent.apps.${iosClientId.replace(
  ".apps.googleusercontent.com",
  "",
)}`;

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
      NSUserNotificationUsageDescription:
        "We use notifications to send optional activity and weather updates.",
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
    googleServicesFile: "./google-services.json",
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.POST_NOTIFICATIONS",
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
    "expo-font",
    "expo-image",
    "expo-secure-store",
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
    "expo-status-bar",
    "expo-web-browser",
    [
      "@react-native-google-signin/google-signin",
      { iosUrlScheme },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/android-icon-monochrome.png",
        color: "#208AEF",
        sounds: [],
      },
    ],
    [
      "react-native-maps",
      {
        iosGoogleMapsApiKey: googleMapsApiKey,
        androidGoogleMapsApiKey: googleMapsApiKey,
      },
    ],
    "@react-native-firebase/app",
    "@react-native-community/datetimepicker",
  ],

  extra: {
    eas: {
      projectId: "c34bfe3b-986c-406d-bd12-3942e75bcec7",
    },
  },

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;