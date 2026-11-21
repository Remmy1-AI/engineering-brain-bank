import * as Linking from 'expo-linking';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Crest } from '@/components/Crest';
import {
  AccentLabel,
  Field,
  GhostButton,
  Muted,
  PrimaryButton,
  SecondaryButton,
  Subtitle,
  Title,
} from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
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
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.appWordmark}>{Brand.appName}</Text>
      <Title>Profile</Title>
      <Subtitle>
        Phone OTP for downloads and progress. Admin email auth stays on the web.
      </Subtitle>

      {isSignedIn ? (
        <View style={styles.card}>
          <AccentLabel>Signed in</AccentLabel>
          <Text style={styles.phone}>{user?.phone}</Text>
          <Muted>
            {supabaseConfigured
              ? 'Session via Supabase Auth.'
              : 'Local stub session (set EXPO_PUBLIC_SUPABASE_* for live OTP).'}
          </Muted>
          <View style={{ marginTop: 16 }}>
            <SecondaryButton label="Sign out" onPress={() => signOut()} />
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <AccentLabel>Phone sign-in</AccentLabel>
          <Text style={styles.cardTitle}>Verify with OTP</Text>
          <View style={{ marginTop: 4 }}>
            <Muted>
              Guests can browse. Sign in to download and save Continue progress.
            </Muted>
          </View>

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
                <PrimaryButton label="Verify & sign in" onPress={onVerify} loading={busy} />
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
                Supabase env not set — mock OTP accepts 123456, or tap below to stub sign-in.
              </Muted>
              <View style={{ marginTop: 10 }}>
                <SecondaryButton
                  label="Stub sign-in (dev)"
                  onPress={() => stubSignIn(phone || '+233200000000')}
                />
              </View>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.about}>
        <Text style={styles.aboutTitle}>About</Text>
        <View style={styles.aboutBrand}>
          <Crest size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.aboutParent}>{Brand.parentBrand}</Text>
            <Text style={styles.aboutName}>{Brand.fullName}</Text>
            <Text style={styles.aboutTag}>{Brand.tagline}</Text>
          </View>
        </View>
        <Text style={styles.link} onPress={() => Linking.openURL(Brand.siteUrl)}>
          boye.study
        </Text>
        <Text style={styles.credit}>{Brand.splashCredit}</Text>
        <Text style={styles.closing}>{Brand.closing}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Brand.bg },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 110 },
  appWordmark: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: Brand.accent,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  card: {
    marginTop: 22,
    padding: 16,
    backgroundColor: Brand.bgCard,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
  },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: Brand.text,
    marginTop: 8,
  },
  phone: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: Brand.text,
    marginTop: 8,
    marginBottom: 6,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Brand.textMuted,
    marginTop: 16,
    marginBottom: 6,
  },
  devBox: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.borderSubtle,
  },
  about: {
    marginTop: 36,
    gap: 8,
  },
  aboutTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: Brand.text,
    marginBottom: 8,
  },
  aboutBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  aboutParent: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    color: Brand.accent,
    textTransform: 'uppercase',
  },
  aboutName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Brand.text,
    marginTop: 2,
  },
  aboutTag: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Brand.textMuted,
    marginTop: 2,
  },
  link: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: Brand.accent,
  },
  credit: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Brand.textDim,
    marginTop: 8,
  },
  closing: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Brand.textDim,
  },
});
