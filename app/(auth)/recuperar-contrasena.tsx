import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../src/firebaseConfig";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

type Props = {
  onBackToLogin?: () => void; // opcional, por si ya lo tienes en tu flujo
};

export default function ForgotPasswordScreen({ onBackToLogin }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const backToLogin = () => {
    if (onBackToLogin) onBackToLogin();
    else router.back();
  };

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      Alert.alert("Email inválido", "Por favor ingresa un email válido.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setEmailSent(true);
    } catch (e: any) {
      const msg =
        e?.code === "auth/user-not-found"
          ? "No existe un usuario con ese correo."
          : e?.code === "auth/invalid-email"
            ? "El correo no es válido."
            : e?.message ?? "No se pudo enviar el email de recuperación.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View className="flex-1 items-center justify-center p-4"
        style={{
          // gradiente suave del mockup (blue->green)
          backgroundColor: "transparent",
        }}
      >
        <View className="absolute inset-0" pointerEvents="none">
          {/* degradado simple con tailwind: */}
          <View className="flex-1 bg-gradient-to-br from-blue-50 to-green-50" />
        </View>

        {/* Card */}
        <View className="w-full max-w-md rounded-2xl bg-white shadow-lg">
          <View className="items-center px-6 pt-6">
            <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Feather name="mail" size={24} color="#16a34a" style={{ alignSelf: "center", marginTop: 12 }} />
            </View>
            <Text className="text-lg font-semibold text-text">Email Enviado</Text>
            <Text className="mt-1 text-center text-sm text-gray-500 px-4">
              Hemos enviado las instrucciones para restablecer tu contraseña a {email}
            </Text>
          </View>

          <View className="px-6 py-6">
            <View className="space-y-2">
              <Text className="text-center text-sm text-gray-500">
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </Text>
              <Text className="text-center text-sm text-gray-500">
                Si no ves el email, revisa tu carpeta de spam.
              </Text>
            </View>

            {/* Botón volver */}
            <Pressable
              onPress={backToLogin}
              className="mt-5 w-full items-center rounded-xl border border-gray-300 py-3"
            >
              <View className="flex-row items-center">
                <Feather name="arrow-left" size={16} color="#111827" />
                <Text className="ml-2 font-medium text-text">Volver al inicio de sesión</Text>
              </View>
            </Pressable>

            {/* Enviar nuevamente */}
            <Pressable
              onPress={() => setEmailSent(false)}
              className="mt-2 w-full items-center rounded-xl py-3"
            >
              <Text className="text-primary font-medium">Enviar nuevamente</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Formulario
  return (
    <View className="flex-1 items-center justify-center p-4">
      <View className="absolute inset-0" pointerEvents="none">
        <View className="flex-1 bg-gradient-to-br from-blue-50 to-green-50" />
      </View>

      {/* Card */}
      <View className="w-full max-w-md rounded-2xl bg-white shadow-lg">
        {/* Header */}
        <View className="items-center px-6 pt-6">
          <View className="mx-auto mb-4 h-12 w-12 items-center justify-center rounded-full bg-primary">
            {/* icono centrado con color de contraste */}
            <Feather name="map-pin" size={24} color="#ffffff" style={{ alignSelf: "center", marginTop: 12 }} />
          </View>
          <Text className="text-lg font-semibold text-text">Recuperar Contraseña</Text>
          <Text className="mt-1 text-center text-sm text-gray-500 px-4">
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
          </Text>
        </View>

        {/* Content */}
        <View className="px-6 py-6">
          {/* Label */}
          <Text className="mb-2 text-sm font-medium text-text">Email</Text>

          {/* Input */}
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="tu@email.com"
            placeholderTextColor="#9ca3af"
            className="mb-4 rounded-xl border border-gray-300 px-4 py-3 text-text"
          />

          {/* Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className={`w-full items-center rounded-xl py-3 ${loading ? "bg-primary-dark/70" : "bg-primary"}`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="font-semibold text-white">Enviar Instrucciones</Text>
            )}
          </Pressable>

          {/* Back link */}
          <Pressable onPress={backToLogin} className="mt-6 w-full items-center">
            <View className="flex-row items-center">
              <Feather name="arrow-left" size={16} color="#22c55e" />
              <Text className="ml-2 text-sm text-primary">Volver al inicio de sesión</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
