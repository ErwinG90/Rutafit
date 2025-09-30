import { View, Text, Pressable, Modal, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useState, useEffect } from "react";
import axios from "axios";
import type { Deporte } from "../interface/Deporte";

export default function EventosScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [nombreEvento, setNombreEvento] = useState("");
    const [deporteId, setDeporteId] = useState<string | undefined>();
    const [lugar, setLugar] = useState("");
    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("");
    const [maxParticipantes, setMaxParticipantes] = useState(1);
    const [descripcion, setDescripcion] = useState("");

    // Estados para deportes dinámicos
    const [deportes, setDeportes] = useState<Deporte[]>([]);

    // ---- Fetch deportes al montar ----
    useEffect(() => {
        const fetchDeportes = async () => {
            try {
                console.log('Llamando a deportes...');
                const deportesRes = await axios.get('https://ms-rutafit-neg.vercel.app/ms-rutafit-neg/tipos-deporte');
                console.log('DEPORTES: ', deportesRes.data);
                setDeportes(deportesRes.data);
            } catch (error) {
                console.log("Error cargando deportes:", error);
            }
        };
        fetchDeportes();
    }, []);

    const handleCrearEvento = () => {
        // Aquí implementarás la lógica para crear el evento
        console.log("Crear evento:", {
            nombreEvento,
            deporteId,
            lugar,
            fecha,
            hora,
            maxParticipantes,
            descripcion
        });
        setModalVisible(false);
    };

    const handleCancelar = () => {
        // Limpiar campos
        setNombreEvento("");
        setDeporteId(undefined);
        setLugar("");
        setFecha("");
        setHora("");
        setMaxParticipantes(1);
        setDescripcion("");
        setModalVisible(false);
    };

    const incrementarParticipantes = () => {
        setMaxParticipantes(prev => prev + 1);
    };

    const decrementarParticipantes = () => {
        setMaxParticipantes(prev => prev > 1 ? prev - 1 : 1);
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header con botón Crear */}
            <View className="flex-row justify-between items-center px-6 py-4">
                <View className="flex-1">
                    <Text className="text-primary text-2xl font-semibold drop-shadow">Eventos</Text>
                    <Text className="text-text text-sm mt-1">Únete o crea eventos deportivos</Text>
                </View>
                <Pressable
                    onPress={() => setModalVisible(true)}
                    className="bg-primary rounded-xl px-4 py-2 flex-row items-center"
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text className="text-white font-semibold ml-1">Crear</Text>
                </Pressable>
            </View>

            {/* Contenido principal */}
            <View className="flex-1 items-center justify-center">
                <Text className="text-text text-xl mb-6">Lista de eventos aquí...</Text>
            </View>

            {/* Modal para crear evento */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white rounded-2xl w-11/12 max-h-5/6">
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="p-6">
                                {/* Header del modal */}
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-xl font-bold text-gray-900">Crear Nuevo Evento</Text>
                                    <Pressable onPress={handleCancelar}>
                                        <Ionicons name="close" size={24} color="#6b7280" />
                                    </Pressable>
                                </View>

                                {/* Título del evento */}
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

                                {/* Deporte */}
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

                                {/* Ubicación */}
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

                                {/* Fecha y Hora */}
                                <View className="flex-row gap-3 mb-4">
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-700 mb-2">Fecha</Text>
                                        <TextInput
                                            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                                            placeholder="dd-mm-aaaa"
                                            placeholderTextColor="#9ca3af"
                                            value={fecha}
                                            onChangeText={setFecha}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-700 mb-2">Hora</Text>
                                        <TextInput
                                            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                                            placeholder="--:--"
                                            placeholderTextColor="#9ca3af"
                                            value={hora}
                                            onChangeText={setHora}
                                        />
                                    </View>
                                </View>

                                {/* Máximo de participantes */}
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

                                {/* Descripción */}
                                <View className="mb-6">
                                    <Text className="text-sm text-gray-700 mb-2">Descripción (opcional)</Text>
                                    <TextInput
                                        className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900 h-20"
                                        placeholder="Describe los detalles del evento..."
                                        placeholderTextColor="#9ca3af"
                                        value={descripcion}
                                        onChangeText={setDescripcion}
                                        multiline={true}
                                        textAlignVertical="top"
                                    />
                                </View>

                                {/* Botones */}
                                <View className="flex-row gap-3">
                                    <Pressable
                                        onPress={handleCrearEvento}
                                        className="flex-1 bg-primary rounded-xl py-3 items-center"
                                    >
                                        <Text className="text-white font-semibold">Crear Evento</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleCancelar}
                                        className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
                                    >
                                        <Text className="text-gray-700 font-semibold">Cancelar</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}