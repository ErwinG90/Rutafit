// app.config.js
import "dotenv/config";

const isDev = process.env.EXPO_PUBLIC_ENV === "dev";

export default {
  expo: {
    name: "RutaFit",
    slug: "rutafit",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "rutafit",
    userInterfaceStyle: "light",
    newArchEnabled: true,

    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    ios: {
      bundleIdentifier: "cl.rutafit.app",
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "RutaFit usa tu ubicación para mostrar mapas y eventos cerca de ti.",
      },
      config: {
        // Solo si más adelante usas mapas nativos en iOS
        googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_KEY,
      },
    },

    android: {
      package: "cl.rutafit.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
      config: {
        googleMaps: {
          // 👉 alterna según EXPO_PUBLIC_ENV (dev/prod)
          apiKey: isDev
            ? process.env.GOOGLE_MAPS_ANDROID_KEY_DEV   // Expo Go (sin restricción de app)
            : process.env.GOOGLE_MAPS_ANDROID_KEY       // APK/Dev Client (package+SHA-1)
        },
      },
    },

    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },

    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "RutaFit necesita tu ubicación para mostrar el mapa y eventos cercanos.",
        },
      ],
      // NO agregues "react-native-maps" en plugins
    ],

    extra: {
      EXPO_PUBLIC_FB_API_KEY: process.env.EXPO_PUBLIC_FB_API_KEY,
      EXPO_PUBLIC_FB_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN,
      EXPO_PUBLIC_FB_PROJECT_ID: process.env.EXPO_PUBLIC_FB_PROJECT_ID,
      EXPO_PUBLIC_FB_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET,
      EXPO_PUBLIC_FB_MESSAGING_SENDER_ID:
        process.env.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FB_APP_ID: process.env.EXPO_PUBLIC_FB_APP_ID,
      
    },
  },
};
