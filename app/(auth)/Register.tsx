// app/(auth)/Register.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { auth } from "../../src/firebaseConfig";
import { validateEmail, validatePassword } from "../../src/validators";

const MESES = [
  { label: "Enero", value: 1 },
  { label: "Febrero", value: 2 },
  { label: "Marzo", value: 3 },
  { label: "Abril", value: 4 },
  { label: "Mayo", value: 5 },
  { label: "Junio", value: 6 },
  { label: "Julio", value: 7 },
  { label: "Agosto", value: 8 },
  { label: "Septiembre", value: 9 },
  { label: "Octubre", value: 10 },
  { label: "Noviembre", value: 11 },
  { label: "Diciembre", value: 12 },
];

const DEPORTES = ["Ciclismo", "Running", "Trekking", "Senderismo"];
const NIVELES = ["Básico", "Intermedio", "Avanzado", "Experto"];
type Genero = "mujer" | "hombre";

export default function RegisterScreen() {
  const router = useRouter();

  // Datos básicos
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  // Perfil (solo UI por ahora)
  const [dia, setDia] = useState<number | undefined>();
  const [mes, setMes] = useState<number | undefined>();
  const [anio, setAnio] = useState<number | undefined>();
  const [genero, setGenero] = useState<Genero>("mujer");
  const [deporte, setDeporte] = useState(DEPORTES[0]);
  const [nivel, setNivel] = useState(NIVELES[0]);

  // UI
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ---- Validaciones ----
  const emailOk = validateEmail(email);
  const pwOk = validatePassword(pw);
  const pwMatch = pw.length > 0 && pw === pw2;
  const nombreOk = nombre.trim().length >= 2;
  const apellidoOk = apellido.trim().length >= 2;

  function calcularEdad(
    d?: number,
    m?: number,
    a?: number
  ): number | null {
    if (!d || !m || !a) return null;
    const hoy = new Date();
    const nacimiento = new Date(a, m - 1, d);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mo = hoy.getMonth() - nacimiento.getMonth();
    if (mo < 0 || (mo === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }

  const edad = calcularEdad(dia, mes, anio);
  const fechaOk = !!edad && edad >= 16;

  const canSubmit =
    emailOk && pwOk && pwMatch && nombreOk && apellidoOk && fechaOk && !submitting;

  // Hints
  const emailHint = useMemo(
    () => (!email || emailOk ? "" : "Formato: palabra@palabra.com | palabra@palabra.cl"),
    [email, emailOk]
  );
  const pwHint = useMemo(
    () => (!pw || pwOk ? "" : "Mín. 6, con minúscula y MAYÚSCULA"),
    [pw, pwOk]
  );
  const pw2Hint = useMemo(
    () => (!pw2 || pwMatch ? "" : "Las contraseñas no coinciden"),
    [pw2, pwMatch]
  );

  function prettyError(e: any) {
    const code = e?.code || "";
    if (code === "auth/email-already-in-use") return "Ese correo ya está registrado.";
    if (code === "auth/invalid-email") return "El correo no es válido.";
    if (code === "auth/weak-password") return "Contraseña muy débil (mín. 6).";
    if (code === "auth/network-request-failed") return "Sin conexión. Revisa tu internet.";
    return "No se pudo crear la cuenta.";
  }

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError(null);
    try {
      // 1) Crear usuario en Firebase
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), pw);

      // 2) Guardar displayName (Nombre + Apellido)
      await updateProfile(user, { displayName: `${nombre.trim()} ${apellido.trim()}` });

      // 3) Guardar usuario en backend
      await axios.post("https://ms-rutafit-neg.vercel.app/ms-rutafit-neg/users", {
        uid: user.uid,
        nombre,
        apellido,
        email,
        fechaNacimiento: `${anio}-${mes?.toString().padStart(2, "0")}-${dia?.toString().padStart(2, "0")}`,
        genero,
        deporteFavorito: deporte,
        nivelExperiencia: nivel,
      });

      // 4) (Opcional) verificación de correo
      try {
        await sendEmailVerification(user);
      } catch { }

      // 5) Ir a tabs (quedaste logueado)
      router.replace("/(tabs)");
    } catch (e: any) {
      setFormError(prettyError(e));
      console.log("signup error:", e);
    } finally {
      setSubmitting(false);
    }
  }

  // Helpers
  const years = (() => {
    const now = new Date().getUTCFullYear();
    const arr: number[] = [];
    for (let y = now; y >= 1950; y--) arr.push(y);
    return arr;
  })();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-6 pt-10 pb-6">
          <Text className="uppercase tracking-widest text-primary text-3xl font-bold drop-shadow mb-2">
            Rutafit
          </Text>
          <Text className="text-lg font-semibold text-white mt-1">Crear cuenta</Text>
        </View>

        <View className="px-6">
          {/* Nombre */}
          <View className="mb-4">
            <Text className="text-[13px] text-white mb-2">Nombre</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-3 h-12 border border-gray-200">
              <Ionicons name="person" size={18} color="#6b7280" />
              <TextInput
                className="flex-1 ml-2 text-text"
                placeholder="Escribe tu nombre"
                placeholderTextColor="#9ca3af"
                value={nombre}
                onChangeText={(t) => {
                  setNombre(t);
                  if (formError) setFormError(null);
                }}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Apellido */}
          <View className="mb-4">
            <Text className="text-[13px] text-white mb-2">Apellido</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-3 h-12 border border-gray-200">
              <Ionicons name="person" size={18} color="#6b7280" />
              <TextInput
                className="flex-1 ml-2 text-text"
                placeholder="Escribe tu apellido"
                placeholderTextColor="#9ca3af"
                value={apellido}
                onChangeText={(t) => {
                  setApellido(t);
                  if (formError) setFormError(null);
                }}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-[13px] text-white mb-2">Email</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-3 h-12 border border-gray-200">
              <Ionicons name="mail" size={18} color="#6b7280" />
              <TextInput
                className="flex-1 ml-2 text-text"
                placeholder="example@gmail.com"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (formError) setFormError(null);
                }}
                returnKeyType="next"
              />
            </View>
            {!!emailHint && <Text className="text-xs mt-1 text-primary">{emailHint}</Text>}
          </View>

          {/* Contraseña */}
          <View className="mb-4">
            <Text className="text-[13px] text-white mb-2">Contraseña</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-3 h-12 border border-gray-200">
              <Ionicons name="lock-closed" size={18} color="#6b7280" />
              <TextInput
                className="flex-1 ml-2 text-text"
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPw}
                value={pw}
                onChangeText={(t) => {
                  setPw(t);
                  if (formError) setFormError(null);
                }}
                returnKeyType="next"
              />
              <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={8}>
                <Ionicons
                  name={showPw ? "eye-off" : "eye"}
                  size={18}
                  color="#6b7280"
                />
              </Pressable>
            </View>
            {!!pwHint && <Text className="text-xs mt-1 text-primary">{pwHint}</Text>}
          </View>

          {/* Repetir contraseña */}
          <View className="mb-4">
            <Text className="text-[13px] text-white mb-2">Repetir contraseña</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-3 h-12 border border-gray-200">
              <Ionicons name="lock-closed" size={18} color="#6b7280" />
              <TextInput
                className="flex-1 ml-2 text-text"
                placeholder="Vuelve a escribir la contraseña"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPw2}
                value={pw2}
                onChangeText={(t) => {
                  setPw2(t);
                  if (formError) setFormError(null);
                }}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
              <Pressable onPress={() => setShowPw2((s) => !s)} hitSlop={8}>
                <Ionicons
                  name={showPw2 ? "eye-off" : "eye"}
                  size={18}
                  color="#6b7280"
                />
              </Pressable>
            </View>
            {!!pw2Hint && <Text className="text-xs mt-1 text-primary">{pw2Hint}</Text>}
          </View>

          {/* Fecha de nacimiento */}
          <Text className="text-[13px] text-white mb-2">Fecha de nacimiento</Text>
          <View className="flex-row gap-3 mb-1">
            <View className="flex-1 bg-gray-100 rounded-xl border border-gray-200">
              <Picker selectedValue={dia} onValueChange={(v) => setDia(v)}>
                <Picker.Item label="DD" value={undefined} />
                {days.map((d) => (
                  <Picker.Item key={d} label={String(d)} value={d} />
                ))}
              </Picker>
            </View>
            <View className="flex-1 bg-gray-100 rounded-xl border border-gray-200">
              <Picker selectedValue={mes} onValueChange={(v) => setMes(v)}>
                <Picker.Item label="Mes" value={undefined} />
                {MESES.map((m) => (
                  <Picker.Item key={m.value} label={m.label} value={m.value} />
                ))}
              </Picker>
            </View>
            <View className="flex-1 bg-gray-100 rounded-xl border border-gray-200">
              <Picker selectedValue={anio} onValueChange={(v) => setAnio(v)}>
                <Picker.Item label="Año" value={undefined} />
                {years.map((y) => (
                  <Picker.Item key={y} label={String(y)} value={y} />
                ))}
              </Picker>
            </View>
          </View>
          {/* Mensaje si es menor de 16 */}
          {!!edad && edad < 16 && (
            <Text className="text-xs mt-1" style={{ color: "#C51217" }}>
              Debes tener al menos 16 años.
            </Text>
          )}

          {/* Género */}
          <Text className="text-[13px] text-white mb-2 mt-4">Género</Text>
          <View className="flex-row gap-3 mb-4">
            <Pressable
              className={`flex-1 rounded-2xl px-6 py-3 items-center border ${genero === "mujer"
                ? "bg-primary/20 border-primary"
                : "bg-gray-100 border-gray-200"
                }`}
              onPress={() => setGenero("mujer")}
            >
              <Text
                className={`${genero === "mujer" ? "text-primary font-semibold" : "text-gray-800"
                  }`}
              >
                Mujer
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 rounded-2xl px-6 py-3 items-center border ${genero === "hombre"
                ? "bg-primary/20 border-primary"
                : "bg-gray-100 border-gray-200"
                }`}
              onPress={() => setGenero("hombre")}
            >
              <Text
                className={`${genero === "hombre" ? "text-primary font-semibold" : "text-gray-800"
                  }`}
              >
                Hombre
              </Text>
            </Pressable>
          </View>

          {/* Deporte */}
          <Text className="text-[13px] text-white mb-2">Deporte</Text>
          <View className="mb-4 bg-gray-100 rounded-xl border border-gray-200">
            <Picker selectedValue={deporte} onValueChange={(v) => setDeporte(v)}>
              {DEPORTES.map((d) => (
                <Picker.Item key={d} label={d} value={d} />
              ))}
            </Picker>
          </View>

          {/* Nivel */}
          <Text className="text-[13px] text-white mb-2">Nivel de experiencia</Text>
          <View className="mb-2 bg-gray-100 rounded-xl border border-gray-200">
            <Picker selectedValue={nivel} onValueChange={(v) => setNivel(v)}>
              {NIVELES.map((n) => (
                <Picker.Item key={n} label={n} value={n} />
              ))}
            </Picker>
          </View>

          {/* Error global */}
          {!!formError && (
            <Text className="mt-2 text-[13px]" style={{ color: "#C51217" }}>
              {formError}
            </Text>
          )}

          {/* Botón Crear */}
          <View className="mt-4 mb-6">
            <Pressable
              className={`rounded-2xl px-6 py-3 items-center ${canSubmit ? "bg-primary" : "bg-primary/50"
                }`}
              disabled={!canSubmit}
              onPress={onSubmit}
            >
              <Text className="text-white font-semibold">
                {submitting ? "Creando..." : "Crear cuenta"}
              </Text>
            </Pressable>
          </View>

          {/* Enlace a Login */}
          <View className="items-center mb-10">
            <Link href="/(auth)/Login">
              <Text className="text-primary">¿Ya tienes cuenta? Inicia sesión</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
