import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 items-center justify-center">
                <Text className="text-text text-3xl font-bold mb-8">Login</Text>

                <Pressable
                    className="rounded-2xl bg-primary px-6 py-3"
                    onPress={() => router.replace("/(tabs)")}
                >
                    <Text className="text-white font-semibold">Entrar</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
