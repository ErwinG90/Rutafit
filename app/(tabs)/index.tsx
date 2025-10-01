import React from "react";
import { View, Text } from "react-native";
import RequestLocationView from "../../src/permissions/RequestLocationView";
import { usePermissionsStore } from "../../src/permissions/store";
import { PermissionStatus } from "../../src/permissions/types";

export default function MapaScreen() {
  const { locationStatus } = usePermissionsStore();

  // Si aún no está concedido, mostramos la UI que pide el permiso
  if (locationStatus !== PermissionStatus.GRANTED) {
    return <RequestLocationView />;
  }

  // Si el permiso está concedido, renderiza tu Home con el mapa
  return (
  <View className="flex-1 items-center justify-center bg-background">
    <Text className="text-xl font-bold">Aquí irá el Mapa proximamente </Text>
    <Text className="text-gray-500 mt-2">
      (Placeholder mientras pruebas permisos)
    </Text>
  </View>
);
}
