import Constants from "expo-constants";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, inMemoryPersistence, setPersistence, type Auth } from "firebase/auth";

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

setPersistence(auth, inMemoryPersistence).catch(() => { });