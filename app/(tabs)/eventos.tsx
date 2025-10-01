import { View, Text, Pressable, Modal, TextInput, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect } from "react";
import type { Deporte } from "../../interface/Deporte";
import { deporteService } from "../../services/DeporteService";

export default function EventosScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [nombreEvento, setNombreEvento] = useState("");
    const [deporteId, setDeporteId] = useState<string | undefined>();
    const [lugar, setLugar] = useState("");

    // Estados para fecha y hora híbrida con DateTimePicker nativo
    const [fechaEvento, setFechaEvento] = useState(new Date());
    const [horaEvento, setHoraEvento] = useState(new Date());
    const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
    const [mostrarTimePicker, setMostrarTimePicker] = useState(false);

    const [maxParticipantes, setMaxParticipantes] = useState(1);
    const [descripcion, setDescripcion] = useState("");
    const [deportes, setDeportes] = useState<Deporte[]>([]);

    useEffect(() => {
        const fetchDeportes = async () => {
            try {
                const deportesRes = await deporteService.getDeportes();
                setDeportes(deportesRes);
            } catch (error) {
                console.log("Error:", error);
            }
        };
        fetchDeportes();
    }, []);

    // Funciones para manejar DateTimePicker
    const onCambiarFecha = (event: any, selectedDate?: Date) => {
        setMostrarDatePicker(false);
        if (selectedDate) {
            setFechaEvento(selectedDate);
        }
    };

    const onCambiarHora = (event: any, selectedTime?: Date) => {
        setMostrarTimePicker(false);
        if (selectedTime) {
            setHoraEvento(selectedTime);
        }
    };

    const obtenerFechaMinima = (): string => {
        return new Date().toISOString().split('T')[0];
    };

    const formatearFechaParaMostrar = (fecha: Date): string => {
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatearHoraParaMostrar = (hora: Date): string => {
        return hora.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Funciones para convertir Date a string para inputs web
    const fechaParaInputWeb = (fecha: Date): string => {
        return fecha.toISOString().split('T')[0];
    };

    const horaParaInputWeb = (hora: Date): string => {
        return hora.toTimeString().split(' ')[0].substring(0, 5);
    };

    const handleCrearEvento = () => {
        console.log("Crear evento:", {
            nombreEvento,
            deporteId,
            lugar,
            fecha: fechaParaInputWeb(fechaEvento), // YYYY-MM-DD
            hora: horaParaInputWeb(horaEvento), // HH:MM
            maxParticipantes,
            descripcion
        });
        setModalVisible(false);
    };

    const handleCancelar = () => {
        setNombreEvento("");
        setDeporteId(undefined);
        setLugar("");
        setFechaEvento(new Date());
        setHoraEvento(new Date());
        setMaxParticipantes(1);
        setDescripcion("");
        setModalVisible(false);
    };

    const incrementarParticipantes = () => {
        setMaxParticipantes(prev => prev + 1);
    };

    const decrementarParticipantes = () => {
        setMaxParticipantes(prev => Math.max(1, prev - 1));
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-between items-center px-6 py-4">
                <View>
                    <Text className="text-3xl font-bold text-green-500 drop-shadow-lg">Rutafit</Text>
                    <Text className="text-sm text-black-500 mt-1">Únete o crea eventos deportivos</Text>
                </View>
                <Pressable
                    onPress={() => setModalVisible(true)}
                    className="bg-primary rounded-full px-4 py-2 flex-row items-center"
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text className="text-white font-semibold ml-1">Crear</Text>
                </Pressable>
            </View>

            <View className="flex-1 px-6">
                <Text className="text-gray-400 text-center mt-20">
                    Cargando Eventos.....
                </Text>
            </View>

            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCancelar}
            >
                <SafeAreaView className="flex-1 bg-white">
                    <ScrollView className="flex-1">
                        <View className="px-6 py-4">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-gray-900">Crear Nuevo Evento</Text>
                                <Pressable onPress={handleCancelar}>
                                    <Ionicons name="close" size={24} color="#6b7280" />
                                </Pressable>
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm text-gray-700 mb-2">Título del evento</Text>
                                <TextInput
                                    className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                                    placeholder="Ej: Carrera matutina en el parque"
                                    placeholderTextColor="#9ca3af"
                                    value={nombreEvento}
                                    onChangeText={setNombreEvento}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm text-gray-700 mb-2">Deporte</Text>
                                <View className="bg-gray-100 rounded-xl border border-gray-200">
                                    <Picker
                                        selectedValue={deporteId}
                                        onValueChange={(itemValue) => setDeporteId(itemValue)}
                                    >
                                        <Picker.Item label="Selecciona un deporte" value={undefined} />
                                        {deportes.map((d) => (
                                            <Picker.Item
                                                key={d._id}
                                                label={d.nombre}
                                                value={d._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm text-gray-700 mb-2">Ubicación</Text>
                                <TextInput
                                    className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                                    placeholder="Ej: Parque Central, Zona Norte"
                                    placeholderTextColor="#9ca3af"
                                    value={lugar}
                                    onChangeText={setLugar}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm text-gray-700 mb-2">Fecha del evento</Text>
                                <View className="bg-gray-100 rounded-xl px-4 py-3">
                                    {Platform.OS === 'web' ? (
                                        <input
                                            type="date"
                                            value={fechaParaInputWeb(fechaEvento)}
                                            min={obtenerFechaMinima()}
                                            onChange={(e) => setFechaEvento(new Date(e.target.value))}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: 'none',
                                                background: 'transparent',
                                                fontSize: '16px',
                                                color: '#374151'
                                            }}
                                        />
                                    ) : (
                                        <Pressable onPress={() => setMostrarDatePicker(true)}>
                                            <Text className="text-gray-900 py-1">
                                                📅 {formatearFechaParaMostrar(fechaEvento)}
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm text-gray-700 mb-2">Hora del evento</Text>
                                <View className="bg-gray-100 rounded-xl px-4 py-3">
                                    {Platform.OS === 'web' ? (
                                        <input
                                            type="time"
                                            value={horaParaInputWeb(horaEvento)}
                                            onChange={(e) => {
                                                const [hours, minutes] = e.target.value.split(':');
                                                const newTime = new Date(horaEvento);
                                                newTime.setHours(parseInt(hours), parseInt(minutes));
                                                setHoraEvento(newTime);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: 'none',
                                                background: 'transparent',
                                                fontSize: '16px',
                                                color: '#374151'
                                            }}
                                        />
                                    ) : (
                                        <Pressable onPress={() => setMostrarTimePicker(true)}>
                                            <Text className="text-gray-900 py-1">
                                                ⏰ {formatearHoraParaMostrar(horaEvento)}
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-sm text-gray-700 mb-2">Máximo de participantes</Text>
                                <View className="flex-row items-center">
                                    <TextInput
                                        className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                                        value={maxParticipantes.toString()}
                                        onChangeText={(text) => {
                                            const num = parseInt(text) || 1;
                                            setMaxParticipantes(num > 0 ? num : 1);
                                        }}
                                        keyboardType="numeric"
                                        selectTextOnFocus={true}
                                    />
                                    <View className="ml-1">
                                        <Pressable
                                            onPress={incrementarParticipantes}
                                            className="bg-gray-200 px-2 py-0.5 rounded-t-md border border-gray-300"
                                        >
                                            <Ionicons name="chevron-up" size={12} color="#374151" />
                                        </Pressable>
                                        <Pressable
                                            onPress={decrementarParticipantes}
                                            className="bg-gray-200 px-2 py-0.5 rounded-b-md border border-gray-300 border-t-0"
                                        >
                                            <Ionicons name="chevron-down" size={12} color="#374151" />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="text-sm text-gray-700 mb-2">Descripción</Text>
                                <TextInput
                                    className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                                    placeholder="Describe tu evento (opcional)"
                                    placeholderTextColor="#9ca3af"
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>

                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={handleCancelar}
                                    className="flex-1 bg-red-500 rounded-xl py-3 items-center"
                                >
                                    <Text className="text-white font-semibold">Cancelar</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleCrearEvento}
                                    className="flex-1 bg-primary rounded-xl py-3 items-center"
                                >
                                    <Text className="text-white font-semibold">Crear Evento</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* DateTimePickers nativos para móvil */}
            {mostrarDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={fechaEvento}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={onCambiarFecha}
                />
            )}

            {mostrarTimePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={horaEvento}
                    mode="time"
                    display="default"
                    onChange={onCambiarHora}
                />
            )}
        </SafeAreaView>
    );
}
