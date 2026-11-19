import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AccentLabel,
  Field,
  LetterMark,
  ListRow,
  PrimaryButton,
  SectionHeader,
  Subtitle,
  Title,
  TypeDot,
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
      <Text style={styles.appWordmark}>{Brand.appName}</Text>
      <Title>Home</Title>
      <Subtitle>
        Your engineering materials, quietly organized. Browse free — sign in to download and
        continue.
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
          {isSignedIn && continueMaterial && continueCourse ? (
            <View style={styles.continueCard}>
              <AccentLabel>Continue learning</AccentLabel>
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
              <Text style={styles.guestTitle}>Browsing as guest</Text>
              <Text style={styles.guestBody}>
                Open any material. Sign in on Profile to unlock downloads and Continue.
              </Text>
              <Text
                style={styles.guestLink}
                onPress={() => router.push('/(tabs)/profile')}>
                Go to Profile →
              </Text>
            </View>
          )}

          <SectionHeader title="Departments" />
          {departments.slice(0, 6).map((d) => (
            <ListRow
              key={d.id}
              title={d.name}
              subtitle={`${d.code} · ${d.count} materials`}
              leading={<LetterMark letters={d.code} />}
              onPress={() => router.push(`/browse/${d.id}`)}
              right={<Text style={styles.chevron}>›</Text>}
            />
          ))}
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
              leading={<TypeDot type={m.type} />}
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
  appWordmark: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: Brand.accent,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  continueCard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Brand.bgCard,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
  },
  continueTitle: {
    fontFamily: 'DMSans_700Bold',
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
    borderRadius: 12,
    backgroundColor: Brand.accentSoft,
  },
  guestTitle: {
    fontFamily: 'DMSans_700Bold',
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
    color: Brand.accent,
    marginTop: 12,
    fontSize: 14,
  },
  seeAll: {
    fontFamily: 'DMSans_500Medium',
    color: Brand.accent,
    marginTop: 12,
    fontSize: 14,
  },
  emptySearch: {
    fontFamily: 'DMSans_400Regular',
    color: Brand.textDim,
    marginTop: 8,
  },
  chevron: {
    color: Brand.textDim,
    fontSize: 22,
    fontFamily: 'DMSans_400Regular',
  },
});
