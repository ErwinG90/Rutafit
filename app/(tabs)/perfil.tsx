import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function PerfilScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 items-center justify-center bg-background">
            <Text className="text-text text-xl mb-6">Perfil</Text>

            <Pressable
                className="rounded-2xl bg-primary px-6 py-3"
                onPress={() => router.replace("/(auth)/Login")}
            >
                <Text className="text-white font-semibold">cerrar</Text>
            </Pressable>
        </View>
    );
}