import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * Supabase client for phone OTP + published catalog (anon key only).
 *
 * Reads (in order):
 *   1. EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
 *   2. BOYE_SUPABASE_URL / BOYE_SUPABASE_ANON_KEY (Cloud Agent secrets)
 *   3. expo.extra.supabaseUrl / supabaseAnonKey (from app.config.js)
 *
 * Never put service_role, access token, DB password, or Bulkclix keys in the app.
 * Until URL+anon are set, getSupabase() returns null and Auth/Catalog use stubs/mock.
 */

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export function readSupabasePublicConfig() {
  const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.BOYE_SUPABASE_URL?.trim() ||
    extra.supabaseUrl?.trim() ||
    '';
  const anonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.BOYE_SUPABASE_ANON_KEY?.trim() ||
    extra.supabaseAnonKey?.trim() ||
    '';
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = readSupabasePublicConfig();
  return Boolean(url && anonKey && url.includes('supabase'));
}

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const { url, anonKey } = readSupabasePublicConfig();
  if (!url || !anonKey) {
    client = null;
    return null;
  }
  client = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

/** Test helper — clears the singleton (does not wipe AsyncStorage sessions). */
export function __resetSupabaseClientForTests() {
  client = undefined;
}
