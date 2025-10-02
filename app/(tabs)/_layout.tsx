import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#22c55e",   // verde principal
                tabBarInactiveTintColor: "#9CA3AF", // gris
                tabBarStyle: {
                    backgroundColor: "#ffffff", // fondo blanco
                    borderTopColor: "#e5e7eb",  // gris claro
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "aaaaa",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="rutas"
                options={{
                    title: "Rutas",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="trail-sign-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="eventos"
                options={{
                    title: "Eventos",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    title: "Perfil",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-circle-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}