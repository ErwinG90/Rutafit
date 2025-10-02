import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { getProfile, clearAllCache } from "../../src/storage/localCache";

export default function PerfilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const cached = await getProfile();
      setProfile(cached);
      setLoading(false);
    })();
  }, []);

  async function onLogout() {
    await clearAllCache(); // limpiamos storage
    router.replace("/(auth)/Login");
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <Text className="text-text mt-2">Cargando perfil…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-text text-2xl font-semibold mb-4">Perfil</Text>

      {profile ? (
        <>
          <Text className="text-text/90 font-semibold mb-2">
            {profile.nombre} {profile.apellido}
          </Text>
          <Text className="text-text/80 mb-1">{profile.email}</Text>
          <Text className="text-text/80 mb-1">
            Fecha nacimiento: {profile.fechaNacimiento}
          </Text>
          <Text className="text-text/80 mb-1">Género: {profile.genero}</Text>
          <Text className="text-text/80 mb-1">
            Deporte favorito: {profile.deporteFavorito}
          </Text>
          <Text className="text-text/80 mb-6">
            Nivel: {profile.nivelExperiencia}
          </Text>
        </>
      ) : (
        <Text className="text-text/80 mb-8">No hay datos de perfil en cache.</Text>
      )}

      <Pressable
        className="rounded-2xl bg-primary px-6 py-3"
        onPress={onLogout}
      >
        <Text className="text-white font-semibold">Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
