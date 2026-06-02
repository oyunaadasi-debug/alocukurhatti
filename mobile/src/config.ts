export const API_URL = 'https://backend-mu-seven-26.vercel.app/api';
export const PRIVACY_URL = 'https://web-ten-kappa-37.vercel.app/kvkk';
export const TERMS_URL = 'https://web-ten-kappa-37.vercel.app/kullanim-kosullari';
export const SUPPORT_URL = 'https://web-ten-kappa-37.vercel.app/destek';

// Mapbox public token (pk.***) — fill in after logging into mapbox.com
export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

export const MAP_INITIAL_REGION = {
  centerCoordinate: [35.0, 39.0] as [number, number], // [lng, lat]
  zoomLevel: 5,
};
