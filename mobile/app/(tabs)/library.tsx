import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, PrimaryButton } from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { getMaterial, materialTypes, type MaterialTypeId } from '@/data/mockCatalog';

const SCREEN_H = Dimensions.get('window').height;
const HERO_H = Math.round(SCREEN_H * 0.22);

function typeLabel(type: MaterialTypeId | string) {
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

/**
 * Downloads tab — offline shelf with sticky black hero (boye.study).
 */
export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const { downloads, removeDownload } = useLibrary();
  const heroPadTop = Math.max(insets.top, 12);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: HERO_H + 16, paddingBottom: 110 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never">
        {!isSignedIn ? (
          <EmptyState
            title="Sign in to keep downloads"
            body="Guests can browse and open materials. Phone OTP unlocks offline saves on this device."
            action={
              <PrimaryButton
                label="Sign in on Profile"
                onPress={() => router.push('/(tabs)/profile')}
              />
            }
          />
        ) : downloads.length === 0 ? (
          <EmptyState
            title="No downloads yet"
            body="Open a material and tap Download to save it offline here."
            action={
              <PrimaryButton
                label="Browse libraries"
                onPress={() => router.push('/(tabs)/browse')}
              />
            }
          />
        ) : (
          <View style={styles.list}>
            {downloads.map((d) => {
              const m = getMaterial(d.materialId);
              if (!m) return null;
              return (
                <View key={d.materialId} style={styles.row}>
                  <View style={styles.fileTile}>
                    <SymbolView
                      name={{
                        ios: 'doc.fill' as any,
                        android: 'description' as any,
                        web: 'description' as any,
                      }}
                      tintColor={Brand.accent}
                      size={22}
                    />
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle} numberOfLines={2}>
                      {m.title}
                    </Text>
                    <Text style={styles.rowMeta} numberOfLines={1}>
                      {typeLabel(m.type)} · {m.course_code} · {mockSize(m.type)}
                    </Text>
                    <View style={styles.actions}>
                      <Pressable
                        onPress={() => router.push(`/material/${m.id}`)}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          styles.openBtn,
                          pressed && { opacity: 0.88 },
                        ]}>
                        <Text style={styles.openBtnText}>Open</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeDownload(d.materialId)}
                        style={({ pressed }) => [
                          styles.actionBtn,
                          styles.deleteBtn,
                          pressed && { opacity: 0.88 },
                        ]}>
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[styles.hero, { height: HERO_H, paddingTop: heroPadTop }]}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Offline on this device</Text>
          <Text style={styles.heroTitle}>Downloads</Text>
          <Text style={styles.heroSub}>
            {isSignedIn
              ? downloads.length
                ? `${downloads.length} file${downloads.length === 1 ? '' : 's'} ready offline`
                : 'Save materials to open without data'
              : 'Sign in to sync your offline shelf'}
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
    paddingHorizontal: 16,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Brand.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
  },
  fileTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Brand.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Brand.text,
    lineHeight: 20,
  },
  rowMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Brand.textDim,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  openBtn: {
    backgroundColor: Brand.accent,
  },
  openBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: Brand.accentInk,
  },
  deleteBtn: {
    backgroundColor: Brand.bgWash,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  deleteBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: Brand.textMuted,
  },
});
