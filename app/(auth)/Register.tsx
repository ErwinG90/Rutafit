import React, { useMemo, useState, useEffect } from "react";
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
import { saveProfile } from "../../src/storage/localCache";
import type { Deporte } from "../interface/Deporte";
import type { Nivel } from "../interface/Nivel";

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

//const DEPORTES = ["Ciclismo", "Running", "Trekking", "Senderismo"];
//const NIVELES = ["Básico", "Intermedio", "Avanzado", "Experto"];
type Genero = "mujer" | "hombre";
const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

export default function RegisterScreen() {
  const router = useRouter();

  // Datos básicos
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  // Perfil aqui falta el deporte y nivel
  const [dia, setDia] = useState<number | undefined>();
  const [mes, setMes] = useState<number | undefined>();
  const [anio, setAnio] = useState<number | undefined>();
  const [genero, setGenero] = useState<Genero>("mujer");
  //const [deporte, setDeporte] = useState(DEPORTES[0]);
  //const [nivel, setNivel] = useState(NIVELES[0]);

  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [deporteId, setDeporteId] = useState<string | undefined>();
  const [nivelId, setNivelId] = useState<string | undefined>();

  // UI
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ---- Fetch deportes y niveles al montar ----
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Llamando a deportes...');
        const deportesRes = await axios.get('https://ms-rutafit-neg.vercel.app/ms-rutafit-neg/tipos-deporte');
        console.log('DEPORTES: ', deportesRes.data);
        setDeportes(deportesRes.data);

        console.log('Llamando a niveles..');
        const nivelesRes = await axios.get('https://ms-rutafit-neg.vercel.app/ms-rutafit-neg/nivel-experiencia');
        console.log('NIVELES: ', nivelesRes.data);
        setNiveles(nivelesRes.data);
      } catch (error) {
        console.log("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  // ---------- VALIDACIONES ----------
  const nombreOk = nombre.trim().length >= 2 && SOLO_LETRAS.test(nombre.trim());
  const apellidoOk = apellido.trim().length >= 2 && SOLO_LETRAS.test(apellido.trim());
  const emailOk = validateEmail(email);
  const pwOk = validatePassword(pw);
  const pwMatch = pw.length > 0 && pw === pw2;

  function calcularEdadSuave(
    d?: number,
    m?: number,
    a?: number
  ): { exactaOK: boolean; edad?: number; futura?: boolean; menor16Posible?: boolean } {
    const hoy = new Date();
    const Y = hoy.getFullYear();
    const M = hoy.getMonth() + 1;
    const D = hoy.getDate();

    if (!a) return { exactaOK: false };
    if (a > Y) return { exactaOK: false, futura: true };

    if (!m || !d) {
      if (a > Y - 16) return { exactaOK: false, menor16Posible: true };
      if (a === Y - 16) return { exactaOK: false, menor16Posible: true };
      return { exactaOK: false };
    }

    const nacimiento = new Date(a, m - 1, d);
    if (nacimiento > hoy) return { exactaOK: false, futura: true };

    let edad = Y - a;
    if (m > M || (m === M && d > D)) edad--;
    return { exactaOK: true, edad };
  }

  const edadInfo = calcularEdadSuave(dia, mes, anio);
  const fechaOk = edadInfo.exactaOK && (edadInfo.edad ?? 0) >= 16;

  const nombreHint = useMemo(
    () => (!nombre || nombreOk ? "" : "Solo letras y mínimo 2 caracteres."),
    [nombre, nombreOk]
  );
  const apellidoHint = useMemo(
    () => (!apellido || apellidoOk ? "" : "Solo letras y mínimo 2 caracteres."),
    [apellido, apellidoOk]
  );
  const emailHint = useMemo(
    () => (!email || emailOk ? "" : "Formato: palabra@dominio.com"),
    [email, emailOk]
  );
  const pwHint = useMemo(
    () => (!pw || pwOk ? "" : "Mínimo 6 caracteres, con minúscula y MAYÚSCULA."),
    [pw, pwOk]
  );
  const pw2Hint = useMemo(
    () => (!pw2 || pwMatch ? "" : "Las contraseñas no coinciden."),
    [pw2, pwMatch]
  );

  const fechaHint = useMemo(() => {
    if (edadInfo.futura) return "La fecha no puede ser futura.";
    if (edadInfo.menor16Posible) return "Debes tener al menos 16 años.";
    if (edadInfo.exactaOK && (edadInfo.edad ?? 0) < 16) return "Debes tener al menos 16 años.";
    return "";
  }, [edadInfo]);

  const canSubmit =
    nombreOk && apellidoOk && emailOk && pwOk && pwMatch && fechaOk && !submitting;

  function prettyError(e: any) {
    const code = e?.code || "";
    if (code === "auth/email-already-in-use") return "Ese correo ya está registrado.";
    if (code === "auth/invalid-email") return "El correo no es válido.";
    if (code === "auth/weak-password") return "Contraseña muy débil (mín. 6).";
    if (code === "auth/network-request-failed") return "Sin conexión. Revisa tu internet.";
    return "No se pudo crear la cuenta.";
  }

  // ---------- SUBMIT ----------
  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError(null);
    setSuccessMsg(null);
    try {
      // 1) Firebase
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      const displayName = `${nombre.trim()} ${apellido.trim()}`;
      await updateProfile(user, { displayName });
      try { await sendEmailVerification(user); } catch { }

      // 2) Backend (best-effort)
      try {
        await axios.post("https://ms-rutafit-neg.vercel.app/ms-rutafit-neg/users", {
          uid: user.uid,
          nombre,
          apellido,
          email,
          fechaNacimiento: `${anio}-${String(mes ?? "").padStart(2, "0")}-${String(dia ?? "").padStart(2, "0")}`,
          genero,
          deporteFavorito: deporteId,
          nivelExperiencia: nivelId,
        });
      } catch (err) {
        console.log("WARN backend:", err);
      }

      // 3) Cache local
      await saveProfile({
        uid: user.uid,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email,
        fechaNacimiento: `${anio}-${String(mes ?? "").padStart(2, "0")}-${String(dia ?? "").padStart(2, "0")}`,
        genero,
        deporteFavorito: deporteId,
        nivelExperiencia: nivelId,
        displayName,
        updatedAt: new Date().toISOString(),
      });

      // 4) Éxito + redirigir a Login
      setSuccessMsg("✅ Cuenta creada exitosamente. Serás redirigido al login…");
      setTimeout(() => router.replace("/(auth)/Login"), 1500);
    } catch (e: any) {
      setFormError(prettyError(e));
      console.log("signup error:", e);
    } finally {
      setSubmitting(false);
    }
  }

  // helpers UI
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
                onChangeText={(t) => { setNombre(t); if (formError) setFormError(null); }}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>
            {!!nombreHint && <Text className="text-xs mt-1" style={{ color: "#C51217" }}>{nombreHint}</Text>}
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
                onChangeText={(t) => { setApellido(t); if (formError) setFormError(null); }}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </View>
            {!!apellidoHint && <Text className="text-xs mt-1" style={{ color: "#C51217" }}>{apellidoHint}</Text>}
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
                onChangeText={(t) => { setEmail(t); if (formError) setFormError(null); }}
                returnKeyType="next"
              />
            </View>
            {!!emailHint && <Text className="text-xs mt-1" style={{ color: "#C51217" }}>{emailHint}</Text>}
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
                onChangeText={(t) => { setPw(t); if (formError) setFormError(null); }}
                returnKeyType="next"
              />
              <Pressable onPress={() => setShowPw((s) => !s)} hitSlop={8}>
                <Ionicons name={showPw ? "eye-off" : "eye"} size={18} color="#6b7280" />
              </Pressable>
            </View>
            {!!pwHint && <Text className="text-xs mt-1" style={{ color: "#C51217" }}>{pwHint}</Text>}
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
                onChangeText={(t) => { setPw2(t); if (formError) setFormError(null); }}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
              <Pressable onPress={() => setShowPw2((s) => !s)} hitSlop={8}>
                <Ionicons name={showPw2 ? "eye-off" : "eye"} size={18} color="#6b7280" />
              </Pressable>
            </View>
            {!!pw2Hint && <Text className="text-xs mt-1" style={{ color: "#C51217" }}>{pw2Hint}</Text>}
          </View>

          {/* Fecha de nacimiento */}
          <Text className="text-[13px] text-white mb-2">Fecha de nacimiento</Text>
          <View className="flex-row gap-3 mb-1">
            {/* Día */}
            <View className="flex-1 bg-gray-100 rounded-xl border border-gray-200">
              <Picker
                selectedValue={dia ?? 0}
                onValueChange={(v: number) => setDia(v === 0 ? undefined : v)}
              >
                <Picker.Item label="Día" value={0} />
                {days.map((d) => (
                  <Picker.Item key={d} label={String(d)} value={d} />
                ))}
              </Picker>
            </View>
            {/* Mes */}
            <View className="flex-1 bg-gray-100 rounded-xl border border-gray-200">
              <Picker
                selectedValue={mes ?? 0}
                onValueChange={(v: number) => setMes(v === 0 ? undefined : v)}
              >
                <Picker.Item label="Mes" value={0} />
                {MESES.map((m) => (
                  <Picker.Item key={m.value} label={m.label} value={m.value} />
                ))}
              </Picker>
            </View>
            {/* Año */}
            <View className="flex-1 bg-gray-100 rounded-xl border border-gray-200">
              <Picker
                selectedValue={anio ?? 0}
                onValueChange={(v: number) => setAnio(v === 0 ? undefined : v)}
              >
                <Picker.Item label="Año" value={0} />
                {years.map((y) => (
                  <Picker.Item key={y} label={String(y)} value={y} />
                ))}
              </Picker>
            </View>
          </View>
          {/* 🔴 Mensaje de validación de fecha */}
          {!!fechaHint && (
            <Text className="text-xs mt-1" style={{ color: "#C51217" }}>
              {fechaHint}
            </Text>
          )}

          {/* Género */}
          <Text className="text-[13px] text-white mb-2 mt-4">Género</Text>
          <View className="flex-row gap-3 mb-4">
            <Pressable
              className={`flex-1 rounded-2xl px-6 py-3 items-center border ${genero === "mujer" ? "bg-primary/20 border-primary" : "bg-gray-100 border-gray-200"
                }`}
              onPress={() => setGenero("mujer")}
            >
              <Text className={`${genero === "mujer" ? "text-primary font-semibold" : "text-gray-800"}`}>
                Mujer
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 rounded-2xl px-6 py-3 items-center border ${genero === "hombre" ? "bg-primary/20 border-primary" : "bg-gray-100 border-gray-200"
                }`}
              onPress={() => setGenero("hombre")}
            >
              <Text className={`${genero === "hombre" ? "text-primary font-semibold" : "text-gray-800"}`}>
                Hombre
              </Text>
            </Pressable>
          </View>

          {/* Deporte */}
          <Text className="text-[13px] text-white mb-2">Deporte</Text>
          <View className="mb-4 bg-gray-100 rounded-xl border border-gray-200">
            <Picker selectedValue={deporteId} onValueChange={(v) => setDeporteId(v)}>
              <Picker.Item label="Selecciona un deporte" value={undefined} />
              {deportes.map((d) => (
                <Picker.Item key={d._id} label={d.nombre} value={d._id} />
              ))}
            </Picker>
          </View>

          {/* Nivel */}
          <Text className="text-[13px] text-white mb-2">Nivel de experiencia</Text>
          <View className="mb-2 bg-gray-100 rounded-xl border border-gray-200">
            <Picker selectedValue={nivelId} onValueChange={(v) => setNivelId(v)}>
              <Picker.Item label="Selecciona un nivel" value={undefined} />
              {niveles.map((n) => (
                <Picker.Item key={n._id} label={n.nombre} value={n._id} />
              ))}
            </Picker>
          </View>

          {/* Mensajes globales */}
          {!!formError && (
            <Text className="mt-2 text-[13px]" style={{ color: "#C51217" }}>
              {formError}
            </Text>
          )}
          {!!successMsg && (
            <Text className="mt-2 text-[13px]" style={{ color: "green" }}>
              {successMsg}
            </Text>
          )}

          {/* Botón Crear */}
          <View className="mt-4 mb-6">
            <Pressable
              className={`rounded-2xl px-6 py-3 items-center ${canSubmit ? "bg-primary" : "bg-primary/50"}`}
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
