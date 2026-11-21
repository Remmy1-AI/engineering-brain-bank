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
 * Downloads — compact list rows (icon · title/meta · open + trash), sticky black hero.
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
          { paddingTop: HERO_H + 8, paddingBottom: 110 + insets.bottom },
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
            {downloads.map((d, i) => {
              const m = getMaterial(d.materialId);
              if (!m) return null;
              return (
                <View key={d.materialId}>
                  <View style={styles.row}>
                    <View style={styles.fileTile}>
                      <SymbolView
                        name={{
                          ios: 'doc.fill' as any,
                          android: 'description' as any,
                          web: 'description' as any,
                        }}
                        tintColor={Brand.accent}
                        size={20}
                      />
                    </View>
                    <Pressable
                      onPress={() => router.push(`/material/${m.id}`)}
                      style={styles.rowBody}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${m.title}`}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {m.title}
                      </Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        {typeLabel(m.type)} · {m.course_code} · {mockSize(m.type)}
                      </Text>
                    </Pressable>
                    <View style={styles.trailing}>
                      <Pressable
                        onPress={() => router.push(`/material/${m.id}`)}
                        hitSlop={10}
                        accessibilityLabel="Open"
                        style={({ pressed }) => [
                          styles.iconBtn,
                          pressed && { opacity: 0.7 },
                        ]}>
                        <SymbolView
                          name={{
                            ios: 'arrow.up.right.square' as any,
                            android: 'open_in_new' as any,
                            web: 'open_in_new' as any,
                          }}
                          tintColor={Brand.accent}
                          size={20}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => removeDownload(d.materialId)}
                        hitSlop={10}
                        accessibilityLabel="Delete"
                        style={({ pressed }) => [
                          styles.iconBtn,
                          pressed && { opacity: 0.7 },
                        ]}>
                        <SymbolView
                          name={{
                            ios: 'trash' as any,
                            android: 'delete' as any,
                            web: 'delete' as any,
                          }}
                          tintColor={Brand.textDim}
                          size={20}
                        />
                      </Pressable>
                    </View>
                  </View>
                  {i < downloads.length - 1 ? <View style={styles.divider} /> : null}
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
    paddingHorizontal: 12,
  },
  list: {
    backgroundColor: Brand.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 64,
  },
  fileTile: {
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
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Brand.border,
    marginLeft: 64,
  },
});
