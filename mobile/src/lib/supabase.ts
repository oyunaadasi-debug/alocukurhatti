import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const EXPO_PUBLIC_SUPABASE_URL = "https://nzdkbibotomtdhxjosme.supabase.co";
const EXPO_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_o08BiNvdbNjej1bG4Mb6EA_MZc3Fs9o";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
