export const API_URL = 'https://backend-mu-seven-26.vercel.app/api';
export const WEB_URL = 'https://alocukurhatti.xyz';
export const PRIVACY_URL = 'https://alocukurhatti.xyz/kvkk';
export const TERMS_URL = 'https://alocukurhatti.xyz/kullanim-kosullari';
export const SUPPORT_URL = 'https://alocukurhatti.xyz/destek';

// Mapbox public token (pk.***) — fill in after logging into mapbox.com
export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

export const MAP_INITIAL_REGION = {
  centerCoordinate: [35.0, 39.0] as [number, number], // [lng, lat]
  zoomLevel: 5,
};
