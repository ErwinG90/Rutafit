import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import RequestLocationView from "../../src/permissions/RequestLocationView";
import { usePermissionsStore } from "../../src/permissions/store";
import { PermissionStatus } from "../../src/permissions/types";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function MapaScreen() {
  const { locationStatus } = usePermissionsStore();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      if (locationStatus === PermissionStatus.GRANTED) {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    })();
  }, [locationStatus]);

  // Si aún no está concedido, mostramos la UI que pide el permiso
  if (locationStatus !== PermissionStatus.GRANTED) {
    return <RequestLocationView />;
  }

  // Si el permiso está concedido pero aún no tenemos la ubicación
  if (!location) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="mt-2 text-gray-500">Obteniendo ubicación...</Text>
      </View>
    );
  }

  // Si el permiso está concedido y ya tenemos la ubicación, renderizamos el mapa
  return (
    <MapView
      style={{ flex: 1 }}

      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker
        coordinate={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }}
        title="Tu ubicación"
        description="Aquí estás ahora mismo"
      />
    </MapView>
  );
}
