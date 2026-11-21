import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Crest } from '@/components/Crest';
import { Field, GhostButton, PrimaryButton } from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { departments } from '@/data/mockCatalog';

export type SplashAuthPhase = 'land' | 'signin' | 'otp' | 'signup' | 'signup-otp';

type Props = {
  /** Force a phase (screenshots / Profile re-auth). */
  initialPhase?: SplashAuthPhase;
  /** Skip land hold when jumping straight into a form. */
  skipLand?: boolean;
  onFinished: () => void;
};

/**
 * Splash → auth gate.
 * Land: Brain Bank centered, by Korle Boye at bottom.
 * Then title shrinks/slides up; phone sign-in + Sign up; signup form; OTP → Home.
 * Guest can continue without auth.
 */
export function SplashAuth({
  initialPhase = 'land',
  skipLand = false,
  onFinished,
}: Props) {
  const insets = useSafeAreaInsets();
  const { requestOtp, verifyOtp, supabaseConfigured, completeSignIn } = useAuth();

  const [phase, setPhase] = useState<SplashAuthPhase>(
    skipLand ? initialPhase : 'land'
  );
  const [phone, setPhone] = useState('+233');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [programmeId, setProgrammeId] = useState(departments[2]?.id ?? 'mechanical');
  const [busy, setBusy] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const titleSize = useSharedValue(40);
  const titleY = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(24);
  const creditOpacity = useSharedValue(1);

  function animateToForm() {
    titleSize.value = withTiming(28, { duration: 480, easing: Easing.out(Easing.cubic) });
    titleY.value = withTiming(-56, { duration: 480, easing: Easing.out(Easing.cubic) });
    formOpacity.value = withDelay(
      160,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) })
    );
    formY.value = withDelay(
      160,
      withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) })
    );
    creditOpacity.value = withTiming(0.55, { duration: 400 });
  }

  useEffect(() => {
    if (skipLand) {
      animateToForm();
      setPhase(initialPhase === 'land' ? 'signin' : initialPhase);
      return;
    }
    if (initialPhase !== 'land') {
      const t = setTimeout(() => {
        animateToForm();
        setPhase(initialPhase);
      }, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      animateToForm();
      setPhase('signin');
    }, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
  }));

  const titleSizeStyle = useAnimatedStyle(() => ({
    fontSize: titleSize.value,
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const creditStyle = useAnimatedStyle(() => ({
    opacity: creditOpacity.value,
  }));

  async function sendCode(nextMode: 'signin' | 'signup') {
    setBusy(true);
    const res = await requestOtp(phone);
    setBusy(false);
    if (!res.ok) {
      Alert.alert('Could not send code', res.error);
      return;
    }
    setAuthMode(nextMode);
    setCode('');
    setPhase(nextMode === 'signup' ? 'signup-otp' : 'otp');
    Alert.alert(
      'Code sent',
      supabaseConfigured
        ? 'Check your SMS for the verification code.'
        : 'Mock mode: use code 123456.'
    );
  }

  async function onVerify() {
    setBusy(true);
    const res = await verifyOtp(phone, code);
    setBusy(false);
    if (!res.ok) {
      Alert.alert('Verification failed', res.error);
      return;
    }
    if (authMode === 'signup') {
      const programme = departments.find((d) => d.id === programmeId)?.name;
      await completeSignIn({
        phone,
        name: name.trim() || undefined,
        programme,
      });
    }
    onFinished();
  }

  const programme = departments.find((d) => d.id === programmeId);

  const showOtp = phase === 'otp' || phase === 'signup-otp';
  const showSignup = phase === 'signup' || phase === 'signup-otp';
  const showSigninPhone = phase === 'signin' || phase === 'otp';

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 28),
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.centerBlock}>
          <Animated.View style={[styles.brandBlock, titleStyle]}>
            <Crest size={phase === 'land' ? 52 : 40} />
            <Text style={styles.parent}>{Brand.parentBrand}</Text>
            <Animated.Text style={[styles.name, titleSizeStyle]}>{Brand.appName}</Animated.Text>
          </Animated.View>

          <Animated.View style={[styles.form, formStyle]} pointerEvents={phase === 'land' ? 'none' : 'auto'}>
            {showSignup ? (
              <>
                <Text style={styles.formEyebrow}>Create account</Text>
                <Text style={styles.label}>Name</Text>
                <Field
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  autoCapitalize="words"
                  editable={!showOtp}
                />
                <Text style={styles.label}>Programme</Text>
                <View style={styles.programmeList}>
                  {departments
                    .filter((d) => d.id !== 'general')
                    .map((d) => {
                      const active = d.id === programmeId;
                      return (
                        <Pressable
                          key={d.id}
                          disabled={showOtp}
                          onPress={() => setProgrammeId(d.id)}
                          style={[
                            styles.programmeChip,
                            active && styles.programmeChipActive,
                          ]}>
                          <Text
                            style={[
                              styles.programmeChipText,
                              active && styles.programmeChipTextActive,
                            ]}>
                            {d.short}
                          </Text>
                        </Pressable>
                      );
                    })}
                </View>
                {programme ? (
                  <Text style={styles.programmeHint}>{programme.name}</Text>
                ) : null}
                <Text style={styles.label}>Phone</Text>
                <Field
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="+233XXXXXXXXX"
                  autoComplete="tel"
                  editable={!showOtp}
                />
              </>
            ) : showSigninPhone ? (
              <>
                <Text style={styles.formEyebrow}>Sign in</Text>
                <Text style={styles.label}>Phone number</Text>
                <Field
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="+233XXXXXXXXX"
                  autoComplete="tel"
                  editable={!showOtp}
                />
              </>
            ) : null}

            {showOtp ? (
              <>
                <Text style={styles.label}>Verification code</Text>
                <Field
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  placeholder={supabaseConfigured ? '6-digit code' : '123456'}
                  maxLength={8}
                />
                <View style={{ marginTop: 16 }}>
                  <PrimaryButton
                    label="Verify & continue"
                    onPress={onVerify}
                    loading={busy}
                  />
                </View>
                <View style={styles.linkRow}>
                  <GhostButton
                    label="Resend code"
                    onPress={() => sendCode(authMode)}
                  />
                  <GhostButton
                    label="Change number"
                    onPress={() => {
                      setCode('');
                      setPhase(authMode === 'signup' ? 'signup' : 'signin');
                    }}
                  />
                </View>
              </>
            ) : phase === 'signin' ? (
              <>
                <View style={{ marginTop: 16 }}>
                  <Pressable
                    onPress={() => sendCode('signin')}
                    disabled={busy}
                    style={({ pressed }) => [
                      styles.blackBtn,
                      pressed && styles.blackBtnPressed,
                      busy && { opacity: 0.5 },
                    ]}>
                    <Text style={styles.blackBtnText}>
                      {busy ? 'Sending…' : 'Continue'}
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => {
                    setAuthMode('signup');
                    setPhase('signup');
                  }}
                  style={styles.signupLink}
                  accessibilityRole="button"
                  accessibilityLabel="Sign up">
                  <Text style={styles.signupLinkMuted}>New here?</Text>
                  <Text style={styles.signupLinkText}>Sign up</Text>
                </Pressable>
                <Pressable onPress={onFinished} style={styles.guestLink}>
                  <Text style={styles.guestLinkText}>Browse as guest</Text>
                </Pressable>
              </>
            ) : phase === 'signup' ? (
              <>
                <View style={{ marginTop: 16 }}>
                  <Pressable
                    onPress={() => {
                      if (!name.trim()) {
                        Alert.alert('Name required', 'Enter your name to sign up.');
                        return;
                      }
                      sendCode('signup');
                    }}
                    disabled={busy}
                    style={({ pressed }) => [
                      styles.blackBtn,
                      pressed && styles.blackBtnPressed,
                      busy && { opacity: 0.5 },
                    ]}>
                    <Text style={styles.blackBtnText}>
                      {busy ? 'Sending…' : 'Send code'}
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => {
                    setAuthMode('signin');
                    setPhase('signin');
                  }}
                  style={styles.signupLink}>
                  <Text style={styles.signupLinkMuted}>Have an account?</Text>
                  <Text style={styles.signupLinkText}>Sign in</Text>
                </Pressable>
                <Pressable onPress={onFinished} style={styles.guestLink}>
                  <Text style={styles.guestLinkText}>Browse as guest</Text>
                </Pressable>
              </>
            ) : null}
          </Animated.View>
        </View>
      </ScrollView>

      <Animated.View style={[styles.bottom, creditStyle]}>
        <Text style={styles.credit}>{Brand.splashCredit}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  centerBlock: {
    alignItems: 'center',
    width: '100%',
  },
  brandBlock: {
    alignItems: 'center',
  },
  parent: {
    marginTop: 12,
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: Brand.accent,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 40,
    color: Brand.text,
    letterSpacing: -0.6,
    marginTop: 6,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    marginTop: 8,
    alignSelf: 'center',
  },
  formEyebrow: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Brand.textMuted,
    marginBottom: 4,
    marginTop: 8,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Brand.textMuted,
    marginTop: 14,
    marginBottom: 6,
  },
  programmeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  programmeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Brand.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Brand.border,
  },
  programmeChipActive: {
    backgroundColor: Brand.heroBg,
    borderColor: Brand.heroBg,
  },
  programmeChipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Brand.text,
  },
  programmeChipTextActive: {
    color: Brand.textOnDark,
  },
  programmeHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Brand.textDim,
    marginTop: 8,
  },
  blackBtn: {
    backgroundColor: Brand.heroBg,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  blackBtnPressed: {
    backgroundColor: Brand.bgElevatedDark,
  },
  blackBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: Brand.textOnDark,
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  signupLinkMuted: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Brand.textMuted,
  },
  signupLinkText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: Brand.accent,
  },
  guestLink: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 6,
  },
  guestLinkText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: Brand.textDim,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  bottom: {
    alignItems: 'center',
    paddingTop: 20,
  },
  credit: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Brand.textDim,
  },
});
