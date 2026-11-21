import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field, LetterMark } from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { courses, departments } from '@/data/mockCatalog';

const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;
/** Sticky Libraries header — match Home hero band */
const HERO_H = Math.round(SCREEN_H * 0.22);
const SEARCH_H = 48;
const SEARCH_OVERLAP = SEARCH_H / 2;
const GRID_GAP = 12;
const GRID_PAD = 16;
const CARD_W = Math.floor((SCREEN_W - GRID_PAD * 2 - GRID_GAP) / 2);

function courseCountFor(deptId: string) {
  return courses.filter((c) => c.department === deptId).length;
}

/**
 * Browse = Libraries catalogue (UMAT-style):
 * black sticky header, overlapping search, 2-column department cards.
 */
export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.short.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q),
    );
  }, [query]);

  const heroPadTop = Math.max(insets.top, 12);
  const stickyBottom = HERO_H + SEARCH_OVERLAP;
  const contentPadTop = stickyBottom + 16;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: contentPadTop, paddingBottom: 110 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never">
        <View style={styles.grid}>
          {filtered.map((d) => {
            const n = courseCountFor(d.id);
            return (
              <Pressable
                key={d.id}
                onPress={() => router.push(`/browse/${d.id}`)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && { opacity: 0.92 },
                ]}>
                <LetterMark letters={d.code} />
                <Text style={styles.cardName} numberOfLines={2}>
                  {d.name}
                </Text>
                <Text style={styles.cardMeta}>
                  {n} {n === 1 ? 'course' : 'courses'}
                </Text>
                <Text style={styles.cardAction}>Browse</Text>
              </Pressable>
            );
          })}
        </View>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No libraries match that search.</Text>
        ) : null}
      </ScrollView>

      <View pointerEvents="box-none" style={styles.stickyBlock}>
        <View style={[styles.hero, { height: HERO_H, paddingTop: heroPadTop }]}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Brain Bank</Text>
            <Text style={styles.heroTitle}>Libraries</Text>
          </View>
        </View>
        <View style={[styles.searchWrap, { top: HERO_H - SEARCH_OVERLAP }]}>
          <Field
            value={query}
            onChangeText={setQuery}
            placeholder="Search libraries…"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.searchField}
          />
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
  stickyBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 12,
  },
  hero: {
    backgroundColor: Brand.heroBg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: SEARCH_OVERLAP + 4,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    justifyContent: 'flex-end',
  },
  heroCopy: {
    paddingBottom: 4,
  },
  eyebrow: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Brand.textMutedOnDark,
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 34,
    color: Brand.textOnDark,
    letterSpacing: -0.6,
  },
  searchWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 21,
  },
  searchField: {
    height: SEARCH_H,
    borderRadius: 999,
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  scroll: {
    flex: 1,
    backgroundColor: Brand.bg,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: GRID_PAD,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  card: {
    width: CARD_W,
    backgroundColor: Brand.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
    gap: 6,
    minHeight: 152,
  },
  cardName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Brand.text,
    lineHeight: 20,
    marginTop: 4,
  },
  cardMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Brand.textDim,
  },
  cardAction: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: Brand.accent,
    marginTop: 8,
  },
  empty: {
    fontFamily: 'DMSans_400Regular',
    color: Brand.textDim,
    textAlign: 'center',
    marginTop: 24,
  },
});
