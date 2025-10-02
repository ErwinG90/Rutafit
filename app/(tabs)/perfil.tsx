import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../../src/firebaseConfig";
import { getProfile, saveProfile, clearAllCache } from "../../src/storage/localCache";
import ProfileHeader from "../../src/components/profile/ProfileHeader";
import StatsCard from "../../src/components/profile/StatsCard";
import SettingsCard from "../../src/components/profile/SettingsCard";
import { enrichProfile, preloadCatalogos } from "../../src/utils/refResolvers";

const API_BASE = "https://ms-rutafit-neg.vercel.app/ms-rutafit-neg";

export default function PerfilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);

  // Precarga catálogos para resolver nombres sin /:id
  useEffect(() => {
    preloadCatalogos();
  }, []);

  const fetchFromApi = useCallback(async (uid: string) => {
    const { data } = await axios.get(`${API_BASE}/users/${encodeURIComponent(uid)}`);
    const enriched = await enrichProfile(data);
    await saveProfile({ ...enriched, updatedAt: new Date().toISOString() });
    return enriched;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setOffline(false);
    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        try {
          const data = await fetchFromApi(uid);
          setProfile(data);
          return;
        } catch {
          setOffline(true);
        }
      }
      const cached = await getProfile();
      const maybeEnriched = cached?._display ? cached : await enrichProfile(cached);
      setProfile(maybeEnriched);
    } finally {
      setLoading(false);
    }
  }, [fetchFromApi]);

  useEffect(() => {
    load();
  }, [load]);

  async function onLogout() {
    try {
      await signOut(auth);
    } finally {
      await clearAllCache();
      router.replace("/(auth)/Login");
    }
  }

  // Si vas a crear una pantalla de ajustes, pásale este handler al SettingsCard
  const openSettings = () => {
    // router.push("/(settings)"); // descomenta y ajusta la ruta cuando tengas esa screen
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="text-text mt-2">Cargando perfil…</Text>
        </View>
      </SafeAreaView>
    );
  }
  const deporteNombre = profile?._display?.deporteFavoritoNombre;
  const nivelNombre = profile?._display?.nivelExperienciaNombre;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Topbar */}
      <View className="px-4 py-2 flex-row items-center justify-between">
        <Text className="text-text text-base font-semibold">Mi Perfil</Text>
        <Pressable
          onPress={onLogout}
          className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-2"
        >
          <Ionicons name="exit-outline" size={18} color="#111827" />
          <Text className="text-text ml-1 font-semibold">Salir</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {offline && (
          <View className="mb-3 rounded-2xl border border-amber-500/30 bg-amber-100 px-3 py-2">
            <Text className="text-amber-700">
              Sin conexión o API no disponible. Mostrando datos en caché.
            </Text>
          </View>
        )}

        <ProfileHeader
          nombre={profile?.nombre}
          apellido={profile?.apellido}
          email={profile?.email}
          deporteNombre={deporteNombre}
          nivelNombre={nivelNombre}
        />


        <StatsCard
          rutas={profile?.stats?.rutas}
          distanciaTotal={profile?.stats?.distanciaTotal}
          eventos={profile?.stats?.eventos}
          metaMensual={profile?.stats?.metaMensual}
        />

        <SettingsCard
          notif={profile?.settings?.notif}
          privacy={profile?.settings?.privacy}
          units={profile?.settings?.units}
        // onOpenSettings={openSettings} // pásalo cuando tengas la screen
        />
      </ScrollView>
    </SafeAreaView>
  );
}
