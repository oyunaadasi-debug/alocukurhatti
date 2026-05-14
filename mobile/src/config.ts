export const API_URL = 'https://alocukurhatti-backend.onrender.com/api';

// Mapbox public token (pk.***) — fill in after logging into mapbox.com
export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

export const MAP_INITIAL_REGION = {
  centerCoordinate: [35.0, 39.0] as [number, number], // [lng, lat]
  zoomLevel: 5,
};
