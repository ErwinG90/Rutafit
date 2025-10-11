// src/utils/google.ts
const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY!;

// --- Decodificar polylines de Google (path codificado) ---
export function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  let index = 0, lat = 0, lng = 0;
  const coordinates: { latitude: number; longitude: number }[] = [];

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return coordinates;
}

// --- Directions: ruta entre origen y destino ---
export async function getDirectionsRoute(params: {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  mode?: "walking" | "driving" | "bicycling";
}) {
  const { origin, destination, mode = "walking" } = params;
  const url =
    `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    `&mode=${mode}&key=${GOOGLE_KEY}`;

  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== "OK") {
    throw new Error(`Directions error: ${json.status} - ${json.error_message || ""}`);
  }

  const route = json.routes[0];
  const overview = route.overview_polyline?.points as string;
  const path = overview ? decodePolyline(overview) : [];

  const legs = route.legs?.[0];
  const distanceMeters = legs?.distance?.value ?? 0;
  const durationSeconds = legs?.duration?.value ?? 0;

  return { path, distanceMeters, durationSeconds, raw: json };
}

// --- Geocoding: convertir texto a coordenadas ---
export async function geocodeAddress(address: string) {
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== "OK") throw new Error(`Geocode error: ${json.status}`);
  const r = json.results[0];
  return {
    formatted: r.formatted_address,
    location: {
      latitude: r.geometry.location.lat,
      longitude: r.geometry.location.lng,
    },
  };
}
