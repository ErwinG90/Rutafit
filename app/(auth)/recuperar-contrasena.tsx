import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../src/firebaseConfig";
import { router } from "expo-router";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert("Correo requerido", "Ingresa tu correo.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      Alert.alert(
        "Correo enviado",
        "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (e: any) {
      const msg =
        e?.code === "auth/user-not-found"
          ? "No existe un usuario con ese correo."
          : e?.code === "auth/invalid-email"
            ? "El correo no es válido."
            : e?.message ?? "No se pudo enviar el correo.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-background">
      <Text className="text-2xl font-semibold text-text mb-2">
        Recuperar contraseña
      </Text>
      <Text className="text-gray-500 mb-4">
        Te enviaremos un enlace para que cambies tu contraseña.
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-text"
        placeholderTextColor="#9ca3af"
      />

      <Pressable
        onPress={onSend}
        disabled={loading}
        className={`rounded-xl py-3 items-center ${loading ? "bg-primary-dark/70" : "bg-primary"
          }`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">Enviar correo</Text>
        )}
      </Pressable>
    </View>
  );
}
