import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Field,
  GhostButton,
  Muted,
  PrimaryButton,
  SecondaryButton,
} from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

const SCREEN_H = Dimensions.get('window').height;
const HERO_H = Math.round(SCREEN_H * 0.22);

/**
 * Profile — sticky black hero, centered guest block, flat About list on cream paper.
 */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const heroPadTop = Math.max(insets.top, 12);
  const {
    isSignedIn,
    user,
    supabaseConfigured,
    requestOtp,
    verifyOtp,
    signOut,
    stubSignIn,
  } = useAuth();

  const [phone, setPhone] = useState('+233');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  async function onSendOtp() {
    setBusy(true);
    const res = await requestOtp(phone);
    setBusy(false);
    if (!res.ok) {
      Alert.alert('Could not send code', res.error);
      return;
    }
    setOtpSent(true);
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
    setCode('');
    setOtpSent(false);
    setSigningIn(false);
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: HERO_H + 28, paddingBottom: 110 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never">
        {isSignedIn ? (
          <View style={styles.guestBlock}>
            <View style={styles.avatar}>
              <SymbolView
                name={{
                  ios: 'person.fill' as any,
                  android: 'person' as any,
                  web: 'person' as any,
                }}
                tintColor={Brand.accent}
                size={36}
              />
            </View>
            <Text style={styles.guestName}>{user?.phone ?? 'Signed in'}</Text>
            <Text style={styles.guestCopy}>
              {supabaseConfigured
                ? 'Session via Supabase Auth. Downloads sync on this device.'
                : 'Local stub session — set EXPO_PUBLIC_SUPABASE_* for live OTP.'}
            </Text>
            <Pressable
              onPress={() => signOut()}
              style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
              accessibilityRole="button"
              accessibilityLabel="Sign out">
              <Text style={styles.ctaText}>Sign out</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.guestBlock}>
            <View style={styles.avatar}>
              <SymbolView
                name={{
                  ios: 'person.fill' as any,
                  android: 'person' as any,
                  web: 'person' as any,
                }}
                tintColor={Brand.accent}
                size={36}
              />
            </View>
            <Text style={styles.guestName}>Guest</Text>
            <Text style={styles.guestCopy}>
              Sign in to sync downloads and Continue across this device.
            </Text>

            {!signingIn ? (
              <Pressable
                onPress={() => setSigningIn(true)}
                style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
                accessibilityRole="button"
                accessibilityLabel="Sign in with phone">
                <SymbolView
                  name={{
                    ios: 'phone.fill' as any,
                    android: 'phone' as any,
                    web: 'phone' as any,
                  }}
                  tintColor={Brand.accent}
                  size={18}
                />
                <Text style={styles.ctaText}>Sign in with phone</Text>
              </Pressable>
            ) : (
              <View style={styles.otpPanel}>
                <Text style={styles.label}>Phone</Text>
                <Field
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="+233XXXXXXXXX"
                  autoComplete="tel"
                />

                {!otpSent ? (
                  <View style={{ marginTop: 14 }}>
                    <PrimaryButton label="Send code" onPress={onSendOtp} loading={busy} />
                  </View>
                ) : (
                  <>
                    <Text style={styles.label}>Verification code</Text>
                    <Field
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      placeholder={supabaseConfigured ? '6-digit code' : '123456'}
                      maxLength={8}
                    />
                    <View style={{ marginTop: 14, gap: 10 }}>
                      <PrimaryButton
                        label="Verify & sign in"
                        onPress={onVerify}
                        loading={busy}
                      />
                      <GhostButton
                        label="Resend / change number"
                        onPress={() => {
                          setOtpSent(false);
                          setCode('');
                        }}
                      />
                    </View>
                  </>
                )}

                {!supabaseConfigured ? (
                  <View style={styles.devBox}>
                    <Muted>
                      Supabase env not set — mock OTP accepts 123456, or stub sign-in.
                    </Muted>
                    <View style={{ marginTop: 10 }}>
                      <SecondaryButton
                        label="Stub sign-in (dev)"
                        onPress={() => stubSignIn(phone || '+233200000000')}
                      />
                    </View>
                  </View>
                ) : null}

                <View style={{ marginTop: 12, alignItems: 'center' }}>
                  <GhostButton
                    label="Cancel"
                    onPress={() => {
                      setSigningIn(false);
                      setOtpSent(false);
                      setCode('');
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.list}>
          <View style={styles.dividerFull} />
          <Pressable
            onPress={() => Linking.openURL(Brand.siteUrl)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.72 }]}
            accessibilityRole="link"
            accessibilityLabel="About Brain Bank">
            <View style={styles.infoTile}>
              <SymbolView
                name={{
                  ios: 'info.circle.fill' as any,
                  android: 'info' as any,
                  web: 'info' as any,
                }}
                tintColor={Brand.accent}
                size={20}
              />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>About</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {Brand.appName} · {Brand.splashCredit}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <View style={styles.dividerFull} />
        </View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[styles.hero, { height: HERO_H, paddingTop: heroPadTop }]}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Your account</Text>
          <Text style={styles.heroTitle}>Profile</Text>
          <Text style={styles.heroSub}>
            Browse free — sign in when you need offline.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Brand.heroBg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 18,
    zIndex: 20,
    elevation: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    justifyContent: 'flex-end',
  },
  heroCopy: {
    gap: 4,
  },
  eyebrow: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Brand.textMutedOnDark,
  },
  heroTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 34,
    color: Brand.textOnDark,
    letterSpacing: -0.6,
  },
  heroSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Brand.textDimOnDark,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
    backgroundColor: Brand.bg,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 0,
  },
  guestBlock: {
    alignItems: 'center',
    paddingHorizontal: 28,
    marginBottom: 36,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Brand.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    color: Brand.text,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  guestCopy: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: Brand.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 22,
    maxWidth: 300,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'stretch',
    backgroundColor: Brand.heroBg,
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  ctaPressed: {
    backgroundColor: Brand.bgElevatedDark,
  },
  ctaText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: Brand.textOnDark,
  },
  otpPanel: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Brand.textMuted,
    marginTop: 12,
    marginBottom: 6,
  },
  devBox: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.borderSubtle,
  },
  list: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
    backgroundColor: 'transparent',
  },
  infoTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Brand.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Brand.text,
  },
  rowMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Brand.textDim,
  },
  chevron: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 22,
    color: Brand.textDim,
    paddingLeft: 4,
  },
  dividerFull: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Brand.border,
  },
});
