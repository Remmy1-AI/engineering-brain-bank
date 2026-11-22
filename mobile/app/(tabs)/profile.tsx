import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
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
import { useCatalog } from '@/context/CatalogContext';
import {
  mockDownloadsForUser,
  type MaterialTypeId,
} from '@/data/mockCatalog';

const SCREEN_H = Dimensions.get('window').height;
const HERO_H = Math.round(SCREEN_H * 0.22);
const CONTINUE_CARD_W = 168;

function typeLabel(
  type: MaterialTypeId | string,
  materialTypes: { id: string; name: string }[]
) {
  return materialTypes.find((t) => t.id === type)?.name ?? type;
}

function mockSize(type: MaterialTypeId | string) {
  switch (type) {
    case 'videos':
      return '48 MB';
    case 'past-questions':
      return '2.4 MB';
    case 'slides':
      return '3.1 MB';
    case 'notes':
      return '1.2 MB';
    default:
      return '890 KB';
  }
}

function maskPhone(phone?: string | null) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 4) return '····';
  return `··${digits.slice(-4)}`;
}

type MenuIcon = {
  ios: string;
  android: string;
};

function MenuIconView({
  icon,
  tint,
}: {
  icon: MenuIcon;
  tint: string;
}) {
  return (
    <SymbolView
      name={{
        ios: icon.ios as any,
        android: icon.android as any,
        web: icon.android as any,
      }}
      tintColor={tint}
      size={20}
    />
  );
}

/**
 * Profile — guest block kept; signed-in gets sticky account hero,
 * Continue Learning cards, and a flat settings menu on cream paper.
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
    openAuthGate,
  } = useAuth();
  const { getMaterial, materialTypes, recentlyAdded, source } = useCatalog();

  const [phone, setPhone] = useState('+233');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const continueItems = useMemo(() => {
    if (source === 'live') {
      return recentlyAdded.slice(0, 4);
    }
    return mockDownloadsForUser
      .map((d) => getMaterial(d.materialId))
      .filter((m): m is NonNullable<typeof m> => Boolean(m))
      .slice(0, 4);
  }, [source, recentlyAdded, getMaterial]);

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

  async function onShareApp() {
    const message = `${Brand.appName} — engineering materials by Korle Boye. ${Brand.siteUrl}`;
    try {
      await Share.share({ message, url: Brand.siteUrl, title: Brand.appName });
    } catch {
      Linking.openURL(Brand.siteUrl);
    }
  }

  const signedMenu: {
    key: string;
    title: string;
    meta?: string;
    icon: MenuIcon;
    onPress: () => void;
    danger?: boolean;
    chevron?: boolean;
  }[] = [
    {
      key: 'programme',
      title: 'Programme',
      meta: user?.programme
        ? user.programme
        : 'Mechanical Engineering · Level 200',
      icon: { ios: 'graduationcap.fill', android: 'school' },
      onPress: () =>
        Alert.alert('Programme', 'Programme picker lands in a later build.'),
      chevron: true,
    },
    {
      key: 'storage',
      title: 'Storage',
      meta: '4.7 MB used on this device',
      icon: { ios: 'internaldrive.fill', android: 'storage' },
      onPress: () => router.push('/(tabs)/library'),
      chevron: true,
    },
    {
      key: 'share',
      title: 'Share Brain Bank',
      meta: 'Invite a classmate',
      icon: { ios: 'square.and.arrow.up', android: 'share' },
      onPress: onShareApp,
      chevron: true,
    },
    {
      key: 'community',
      title: 'Join community',
      meta: 'boye.study',
      icon: { ios: 'person.3.fill', android: 'groups' },
      onPress: () => Linking.openURL(Brand.siteUrl),
      chevron: true,
    },
    {
      key: 'about',
      title: 'About',
      meta: `${Brand.appName} · ${Brand.splashCredit}`,
      icon: { ios: 'info.circle.fill', android: 'info' },
      onPress: () => Linking.openURL(Brand.siteUrl),
      chevron: true,
    },
    {
      key: 'signout',
      title: 'Sign out',
      icon: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout' },
      onPress: () => signOut(),
      danger: true,
      chevron: false,
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: HERO_H + (isSignedIn ? 20 : 28),
            paddingBottom: 110 + insets.bottom,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never">
        {isSignedIn ? (
          <>
            <View style={styles.continueSection}>
              <Text style={styles.sectionLabel}>Continue learning</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.continueRow}
                decelerationRate="fast">
                {continueItems.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => router.push(`/material/${m.id}`)}
                    style={({ pressed }) => [
                      styles.continueCard,
                      pressed && { opacity: 0.88 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Continue ${m.title}`}>
                    <Text style={styles.continueType}>
                      {typeLabel(m.type, materialTypes)}
                    </Text>
                    <Text style={styles.continueTitle} numberOfLines={2}>
                      {m.title}
                    </Text>
                    <Text style={styles.continueMeta} numberOfLines={1}>
                      {m.course_code} · {mockSize(m.type)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.list}>
              <View style={styles.dividerFull} />
              {signedMenu.map((item, i) => {
                const tint = item.danger ? Brand.crestRed : Brand.accent;
                const titleColor = item.danger ? Brand.crestRed : Brand.text;
                return (
                  <View key={item.key}>
                    <Pressable
                      onPress={item.onPress}
                      style={({ pressed }) => [
                        styles.row,
                        pressed && { opacity: 0.72 },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={item.title}>
                      <View
                        style={[
                          styles.infoTile,
                          item.danger && styles.infoTileDanger,
                        ]}>
                        <MenuIconView icon={item.icon} tint={tint} />
                      </View>
                      <View style={styles.rowBody}>
                        <Text style={[styles.rowTitle, { color: titleColor }]}>
                          {item.title}
                        </Text>
                        {item.meta ? (
                          <Text style={styles.rowMeta} numberOfLines={1}>
                            {item.meta}
                          </Text>
                        ) : null}
                      </View>
                      {item.chevron !== false ? (
                        <Text style={styles.chevron}>›</Text>
                      ) : null}
                    </Pressable>
                    {i < signedMenu.length - 1 ? (
                      <View style={styles.dividerInset} />
                    ) : (
                      <View style={styles.dividerFull} />
                    )}
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <>
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
                onPress={() => openAuthGate({ phase: 'signin' })}
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
                          onPress={() => stubSignIn(phone || '+233241234567')}
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

            <View style={styles.list}>
              <View style={styles.dividerFull} />
              <Pressable
                onPress={() => Linking.openURL(Brand.siteUrl)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.72 }]}
                accessibilityRole="link"
                accessibilityLabel="About Brain Bank">
                <View style={styles.infoTile}>
                  <MenuIconView
                    icon={{ ios: 'info.circle.fill', android: 'info' }}
                    tint={Brand.accent}
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
          </>
        )}
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[styles.hero, { height: HERO_H, paddingTop: heroPadTop }]}>
        {isSignedIn ? (
          <View style={styles.signedHeroRow}>
            <View style={styles.signedAvatar}>
              <SymbolView
                name={{
                  ios: 'person.fill' as any,
                  android: 'person' as any,
                  web: 'person' as any,
                }}
                tintColor={Brand.heroBg}
                size={28}
              />
            </View>
            <View style={styles.signedHeroCopy}>
              <Text style={styles.eyebrow}>Signed in</Text>
              <Text style={styles.heroTitle} numberOfLines={1}>
                {maskPhone(user?.phone)}
              </Text>
              <Text style={styles.heroSub} numberOfLines={1}>
                {user?.phone ?? ''}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Your account</Text>
            <Text style={styles.heroTitle}>Profile</Text>
            <Text style={styles.heroSub}>
              Browse free — sign in when you need offline.
            </Text>
          </View>
        )}
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
  signedHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  signedAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Brand.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signedHeroCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
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
  continueSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Brand.textMuted,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  continueRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  continueCard: {
    width: CONTINUE_CARD_W,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Brand.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Brand.border,
    gap: 6,
  },
  continueType: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Brand.accent,
  },
  continueTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Brand.text,
    lineHeight: 20,
    minHeight: 40,
  },
  continueMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Brand.textDim,
    marginTop: 2,
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
  infoTileDanger: {
    backgroundColor: 'rgba(198, 40, 40, 0.12)',
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
  dividerInset: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Brand.border,
    marginLeft: 68,
  },
});
