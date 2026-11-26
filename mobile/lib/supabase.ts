import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

/**
 * Supabase client for phone OTP (student auth).
 * Reads EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY from env.
 * Never put service_role keys in the app.
 *
 * Until env is set, getSupabase() returns null and AuthContext uses a local stub.
 */

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

function readConfig() {
  const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ||
    extra.supabaseUrl?.trim() ||
    '';
  const anonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    extra.supabaseAnonKey?.trim() ||
    '';
  return { url, anonKey };
}

let client: SupabaseClient | null | undefined;

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = readConfig();
  return Boolean(url && anonKey);
}

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const { url, anonKey } = readConfig();
  if (!url || !anonKey) {
    client = null;
    return null;
  }
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}
