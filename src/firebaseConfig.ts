// src/firebaseConfig.ts (modo Web estable)
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth, setPersistence, browserLocalPersistence, inMemoryPersistence } from "firebase/auth";

const extra = Constants.expoConfig?.extra ?? {};
const firebaseConfig = {
  apiKey: extra.EXPO_PUBLIC_FB_API_KEY,
  authDomain: extra.EXPO_PUBLIC_FB_AUTH_DOMAIN,
  projectId: extra.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket: extra.EXPO_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: extra.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: extra.EXPO_PUBLIC_FB_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Web persistente, nativo temporal en memoria (para que compile y puedas seguir)
if (Platform.OS === "web") {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
} else {
  setPersistence(auth, inMemoryPersistence).catch(() => {});
}
