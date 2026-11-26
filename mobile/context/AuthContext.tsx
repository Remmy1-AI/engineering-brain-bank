import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'brainbank.auth.stub';

export type AuthUser = {
  phone: string;
  /** Stub sessions set this; live Supabase sessions use the UUID */
  id: string;
  name?: string;
  programme?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isSignedIn: boolean;
  isReady: boolean;
  supabaseConfigured: boolean;
  /** Cold-start / Profile: show splash→auth overlay */
  authGateOpen: boolean;
  /** True after first hydrate decided signed-in vs guest gate */
  bootResolved: boolean;
  openAuthGate: (opts?: { phase?: 'signin' | 'signup' }) => void;
  closeAuthGate: () => void;
  authGatePhase: 'signin' | 'signup' | null;
  /** Skip land splash animation (Profile re-open / signup deep link). */
  authGateSkipLand: boolean;
  /** Send OTP — Supabase when configured, else mock accept any E.164-ish phone */
  requestOtp: (phone: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  /** Verify OTP — Supabase when configured, else accept code "123456" */
  verifyOtp: (
    phone: string,
    token: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  /** Merge profile fields after signup OTP (stub / local). */
  completeSignIn: (profile: {
    phone: string;
    name?: string;
    programme?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  /** Dev helper: flip signed-in without OTP (for Home Continue demos) */
  stubSignIn: (phone?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizePhone(raw: string) {
  const trimmed = raw.trim().replace(/\s+/g, '');
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return trimmed;
  // Ghana default for local numbers starting with 0
  if (/^0\d{9}$/.test(trimmed)) return `+233${trimmed.slice(1)}`;
  return trimmed;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [authGatePhase, setAuthGatePhase] = useState<'signin' | 'signup' | null>(null);
  const [authGateSkipLand, setAuthGateSkipLand] = useState(false);
  const [bootResolved, setBootResolved] = useState(false);
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const sb = getSupabase();
        if (sb) {
          const { data } = await sb.auth.getSession();
          if (!cancelled && data.session?.user) {
            setUser({
              id: data.session.user.id,
              phone: data.session.user.phone || data.session.user.email || 'signed-in',
            });
          }
        } else {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (!cancelled && raw) {
            setUser(JSON.parse(raw) as AuthUser);
          }
        }
      } catch {
        // ignore hydrate errors
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Cold start: open gate for guests; signed-in users get a brief splash only (layout).
  useEffect(() => {
    if (!isReady || bootResolved) return;
    if (!user) {
      setAuthGateSkipLand(false);
      setAuthGateOpen(true);
      setAuthGatePhase('signin');
    }
    setBootResolved(true);
  }, [isReady, user, bootResolved]);

  const persistStub = useCallback(async (next: AuthUser | null) => {
    setUser(next);
    if (next) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const requestOtp = useCallback(async (phoneRaw: string) => {
    const phone = normalizePhone(phoneRaw);
    if (!phone || phone.length < 10) {
      return { ok: false as const, error: 'Enter a valid phone number with country code.' };
    }

    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.auth.signInWithOtp({ phone });
      if (error) return { ok: false as const, error: error.message };
      return { ok: true as const };
    }

    // Stub: pretend SMS was sent
    return { ok: true as const };
  }, []);

  const verifyOtp = useCallback(
    async (phoneRaw: string, token: string) => {
      const phone = normalizePhone(phoneRaw);
      if (!phone) {
        return { ok: false as const, error: 'Phone is required.' };
      }
      if (!token.trim()) {
        return { ok: false as const, error: 'Enter the verification code.' };
      }

      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.auth.verifyOtp({
          phone,
          token: token.trim(),
          type: 'sms',
        });
        if (error) return { ok: false as const, error: error.message };
        const u = data.user;
        if (!u) return { ok: false as const, error: 'No user returned.' };
        setUser({ id: u.id, phone: u.phone || phone });
        return { ok: true as const };
      }

      // Stub OTP — accept 123456 for local demos
      if (token.trim() !== '123456') {
        return { ok: false as const, error: 'Invalid code. Use 123456 in mock mode.' };
      }
      await persistStub({ id: `stub-${phone}`, phone });
      return { ok: true as const };
    },
    [persistStub]
  );

  const completeSignIn = useCallback(
    async (profile: { phone: string; name?: string; programme?: string }) => {
      const phone = normalizePhone(profile.phone);
      const next: AuthUser = {
        id: user?.id || `stub-${phone}`,
        phone,
        name: profile.name,
        programme: profile.programme,
      };
      await persistStub(next);
    },
    [persistStub, user?.id]
  );

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (sb) {
      await sb.auth.signOut();
      setUser(null);
      setAuthGateSkipLand(false);
      setAuthGateOpen(true);
      setAuthGatePhase('signin');
      return;
    }
    await persistStub(null);
    setAuthGateSkipLand(false);
    setAuthGateOpen(true);
    setAuthGatePhase('signin');
  }, [persistStub]);

  const stubSignIn = useCallback(
    async (phone = '+233241234567') => {
      await persistStub({ id: `stub-${phone}`, phone: normalizePhone(phone) });
      setAuthGateOpen(false);
    },
    [persistStub]
  );

  const openAuthGate = useCallback((opts?: { phase?: 'signin' | 'signup' }) => {
    setAuthGateSkipLand(true);
    setAuthGatePhase(opts?.phase ?? 'signin');
    setAuthGateOpen(true);
  }, []);

  const closeAuthGate = useCallback(() => {
    setAuthGateOpen(false);
    setAuthGatePhase(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isSignedIn: Boolean(user),
      isReady,
      supabaseConfigured,
      authGateOpen,
      bootResolved,
      openAuthGate,
      closeAuthGate,
      authGatePhase,
      authGateSkipLand,
      requestOtp,
      verifyOtp,
      completeSignIn,
      signOut,
      stubSignIn,
    }),
    [
      user,
      isReady,
      supabaseConfigured,
      authGateOpen,
      bootResolved,
      openAuthGate,
      closeAuthGate,
      authGatePhase,
      authGateSkipLand,
      requestOtp,
      verifyOtp,
      completeSignIn,
      signOut,
      stubSignIn,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
