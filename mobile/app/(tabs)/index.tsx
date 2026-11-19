import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Crest } from '@/components/Crest';
import {
  Field,
  GoldLabel,
  ListRow,
  PrimaryButton,
  SectionHeader,
  Subtitle,
  Title,
} from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import {
  departments,
  getCourse,
  getMaterial,
  recentlyAdded,
  searchCatalog,
} from '@/data/mockCatalog';

export default function HomeScreen() {
  const { isSignedIn, user } = useAuth();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchCatalog(query), [query]);
  const continueMaterial = getMaterial('m2');
  const continueCourse = continueMaterial ? getCourse(continueMaterial.courseId) : null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.brandRow}>
        <Crest size={36} />
        <View style={{ flex: 1 }}>
          <GoldLabel>{Brand.parentBrand}</GoldLabel>
          <Text style={styles.brandName}>{Brand.fullName}</Text>
        </View>
      </View>

      <Title>Home</Title>
      <Subtitle>
        Browse engineering materials free. Sign in with phone to download and keep progress.
      </Subtitle>

      <Field
        value={query}
        onChangeText={setQuery}
        placeholder="Search courses or materials…"
        autoCapitalize="none"
        autoCorrect={false}
        style={{ marginTop: 18 }}
        returnKeyType="search"
      />

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
              onPress={() => router.push(`/browse/course/${c.id}`)}
            />
          ))}
          {results.materials.map((m) => (
            <ListRow
              key={m.id}
              title={m.title}
              subtitle={`${m.course_code} · ${m.topic}`}
              onPress={() => router.push(`/material/${m.id}`)}
            />
          ))}
        </View>
      ) : (
        <>
          {isSignedIn && continueMaterial && continueCourse ? (
            <View style={styles.continueCard}>
              <GoldLabel>Continue learning</GoldLabel>
              <Text style={styles.continueTitle}>{continueMaterial.title}</Text>
              <Text style={styles.continueMeta}>
                {continueCourse.code} · {continueCourse.name}
              </Text>
              <View style={{ marginTop: 14 }}>
                <PrimaryButton
                  label="Continue"
                  onPress={() => router.push(`/material/${continueMaterial.id}`)}
                />
              </View>
              <Text style={styles.phoneHint}>Signed in as {user?.phone}</Text>
            </View>
          ) : (
            <View style={styles.guestBanner}>
              <Text style={styles.guestTitle}>Learning as guest</Text>
              <Text style={styles.guestBody}>
                Open materials freely. Sign in on Profile to unlock downloads and Continue.
              </Text>
              <Text
                style={styles.guestLink}
                onPress={() => router.push('/(tabs)/profile')}>
                Go to Profile →
              </Text>
            </View>
          )}

          <SectionHeader title="Departments" />
          <View style={styles.deptGrid}>
            {departments.slice(0, 6).map((d) => (
              <Text
                key={d.id}
                style={styles.deptChip}
                onPress={() => router.push(`/browse/${d.id}`)}>
                {d.icon} {d.short}
              </Text>
            ))}
          </View>
          <Text style={styles.seeAll} onPress={() => router.push('/(tabs)/browse')}>
            See all departments →
          </Text>

          <SectionHeader title="Recently added" />
          {recentlyAdded.map((m) => (
            <ListRow
              key={m.id}
              title={m.title}
              subtitle={`${m.course_code} · ${m.topic}`}
              meta={`${m.downloads} opens`}
              onPress={() => router.push(`/material/${m.id}`)}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Brand.bg },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },
  brandName: {
    fontFamily: 'Syne_700Bold',
    fontSize: 16,
    color: Brand.text,
    marginTop: 2,
  },
  continueCard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Brand.bgCard,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 4,
  },
  continueTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    color: Brand.text,
    marginTop: 8,
  },
  continueMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Brand.textMuted,
    marginTop: 4,
  },
  phoneHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Brand.textDim,
    marginTop: 10,
  },
  guestBanner: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Brand.borderSubtle,
    borderRadius: 4,
    backgroundColor: Brand.bgElevated,
  },
  guestTitle: {
    fontFamily: 'Syne_700Bold',
    fontSize: 16,
    color: Brand.text,
  },
  guestBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Brand.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  guestLink: {
    fontFamily: 'DMSans_500Medium',
    color: Brand.gold,
    marginTop: 12,
    fontSize: 14,
  },
  deptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deptChip: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Brand.text,
    backgroundColor: Brand.bgCard,
    borderWidth: 1,
    borderColor: Brand.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    overflow: 'hidden',
  },
  seeAll: {
    fontFamily: 'DMSans_500Medium',
    color: Brand.gold,
    marginTop: 12,
    fontSize: 14,
  },
  emptySearch: {
    fontFamily: 'DMSans_400Regular',
    color: Brand.textDim,
    marginTop: 8,
  },
});
