import { router } from 'expo-router';
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

import {
  Field,
  LetterMark,
  ListRow,
  SectionHeader,
  TypeDot,
} from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import {
  courses,
  departments,
  getCourse,
  getMaterial,
  mockActivity,
  searchCatalog,
} from '@/data/mockCatalog';

const SCREEN_H = Dimensions.get('window').height;
const HERO_H = Math.round(SCREEN_H * 0.3);
const SEARCH_H = 48;
const SEARCH_OVERLAP = SEARCH_H / 2;

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function displayName(isSignedIn: boolean, phone?: string | null) {
  if (!isSignedIn || !phone) return 'there';
  // Stub: show a short friendly label from phone
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 4) return `…${digits.slice(-4)}`;
  return phone;
}

function initialsFrom(isSignedIn: boolean, phone?: string | null) {
  if (!isSignedIn) return '?';
  const digits = (phone || '').replace(/\D/g, '');
  return digits.slice(-2) || 'BB';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isSignedIn, user } = useAuth();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchCatalog(query), [query]);
  const greeting = greetingForHour(new Date().getHours());
  const name = displayName(isSignedIn, user?.phone);
  const continueMaterial = getMaterial('m2');
  const continueCourse = continueMaterial ? getCourse(continueMaterial.courseId) : null;

  /** Deduped trending materials from mock campus activity (newest signal first). */
  const trendingMaterials = useMemo(() => {
    const seen = new Set<string>();
    const rows: { id: string; material: NonNullable<ReturnType<typeof getMaterial>>; when: string }[] =
      [];
    for (const a of mockActivity) {
      if (seen.has(a.materialId)) continue;
      const m = getMaterial(a.materialId);
      if (!m) continue;
      seen.add(a.materialId);
      rows.push({ id: a.id, material: m, when: a.when });
    }
    return rows;
  }, []);

  const heroPadTop = Math.max(insets.top, 12) + 8;
  // Content below search: hero height minus overlap, then room for the hanging search
  const bodyPadTop = HERO_H - SEARCH_OVERLAP + SEARCH_H / 2 + 12;

  return (
    <View style={styles.root}>
      {/* Flush-top color slab — only bottom corners rounded */}
      <View style={[styles.hero, { height: HERO_H, paddingTop: heroPadTop }]}>
        <View style={styles.heroRow}>
          <View style={styles.heroLeft}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {name}
            </Text>
            <Pressable
              onPress={() => {
                if (isSignedIn && continueMaterial) {
                  router.push(`/material/${continueMaterial.id}`);
                } else {
                  router.push('/(tabs)/browse');
                }
              }}
              style={({ pressed }) => [
                styles.heroBtn,
                pressed && { opacity: 0.88 },
              ]}>
              <Text style={styles.heroBtnText}>
                {isSignedIn && continueCourse
                  ? `Continue · ${continueCourse.code}`
                  : 'Browse courses'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityLabel="Profile"
            style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.85 }]}>
            <Text style={styles.avatarText}>
              {initialsFrom(isSignedIn, user?.phone)}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Search straddles hero / paper seam */}
      <View
        style={[
          styles.searchWrap,
          { top: HERO_H - SEARCH_OVERLAP },
        ]}>
        <Field
          value={query}
          onChangeText={setQuery}
          placeholder="Search courses or materials…"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.searchField}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: bodyPadTop }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {query.trim() ? (
          <View>
            <SectionHeader title="Search results" />
            {results.courses.length === 0 && results.materials.length === 0 ? (
              <Text style={styles.emptySearch}>No matches.</Text>
            ) : null}
            {results.courses.map((c) => (
              <ListRow
                key={c.id}
                title={`${c.code} · ${c.name}`}
                subtitle={departments.find((d) => d.id === c.department)?.name}
                leading={<LetterMark letters={c.code.replace(/\s/g, '').slice(0, 3)} />}
                onPress={() => router.push(`/browse/course/${c.id}`)}
              />
            ))}
            {results.materials.map((m) => (
              <ListRow
                key={m.id}
                title={m.title}
                subtitle={`${m.course_code} · ${m.topic}`}
                leading={<TypeDot type={m.type} />}
                onPress={() => router.push(`/material/${m.id}`)}
              />
            ))}
          </View>
        ) : (
          <>
            {/* 1) Horizontal card carousel — swipe sideways */}
            <SectionHeader
              title="Courses"
              action={
                <Text style={styles.seeAll} onPress={() => router.push('/(tabs)/browse')}>
                  See all
                </Text>
              }
            />
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.courseRow}
              style={styles.courseScroll}>
              {courses.slice(0, 8).map((c) => {
                const dept = departments.find((d) => d.id === c.department);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => router.push(`/browse/course/${c.id}`)}
                    style={({ pressed }) => [
                      styles.courseCard,
                      pressed && { opacity: 0.9 },
                    ]}>
                    <LetterMark letters={c.code.replace(/\s/g, '').slice(0, 3)} />
                    <Text style={styles.courseCode}>{c.code}</Text>
                    <Text style={styles.courseName} numberOfLines={2}>
                      {c.name}
                    </Text>
                    <Text style={styles.courseMeta} numberOfLines={1}>
                      {dept?.short ?? c.department} · L{c.level}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* 2) Vertical feed — trending materials people are opening */}
            <SectionHeader title="Trending" />
            <Text style={styles.feedHint}>
              Learning materials people are reading and opening
            </Text>
            {trendingMaterials.map((row) => (
              <ListRow
                key={row.id}
                title={row.material.title}
                subtitle={`${row.material.course_code} · ${row.material.topic}`}
                meta={`${row.material.downloads} opens · ${row.when}`}
                leading={<TypeDot type={row.material.type} />}
                onPress={() => router.push(`/material/${row.material.id}`)}
              />
            ))}
          </>
        )}
      </ScrollView>
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
    backgroundColor: Brand.accent,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: SEARCH_OVERLAP + 16,
    zIndex: 1,
  },
  heroRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  heroLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 4,
  },
  greeting: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
  },
  heroName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 32,
    color: Brand.accentInk,
    letterSpacing: -0.5,
    marginTop: 2,
    marginBottom: 14,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Brand.accentInk,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  heroBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: Brand.accent,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  avatarText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: Brand.accentInk,
  },
  searchWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 2,
  },
  searchField: {
    height: SEARCH_H,
    borderRadius: 14,
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  scroll: {
    flex: 1,
    backgroundColor: Brand.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  courseScroll: {
    marginHorizontal: -20,
  },
  courseRow: {
    paddingHorizontal: 20,
    gap: 12,
    paddingVertical: 4,
  },
  courseCard: {
    width: 148,
    backgroundColor: Brand.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: 14,
    gap: 8,
  },
  courseCode: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: Brand.accent,
    marginTop: 4,
  },
  courseName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Brand.text,
    lineHeight: 20,
  },
  courseMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Brand.textDim,
  },
  seeAll: {
    fontFamily: 'DMSans_500Medium',
    color: Brand.accent,
    fontSize: 13,
  },
  feedHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Brand.textDim,
    marginBottom: 4,
  },
  emptySearch: {
    fontFamily: 'DMSans_400Regular',
    color: Brand.textDim,
    marginTop: 8,
  },
});
