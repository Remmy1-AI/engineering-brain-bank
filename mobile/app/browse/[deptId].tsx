import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LetterMark, ListRow, Muted } from '@/components/ui';
import { Brand } from '@/constants/Colors';
import {
  getCoursesByDepartment,
  getDepartment,
  levels,
} from '@/data/mockCatalog';

export default function DepartmentScreen() {
  const { deptId } = useLocalSearchParams<{ deptId: string }>();
  const dept = getDepartment(deptId);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const courses = useMemo(() => {
    const all = getCoursesByDepartment(deptId);
    if (!levelFilter) return all;
    return all.filter((c) => c.level === levelFilter);
  }, [deptId, levelFilter]);

  return (
    <>
      <Stack.Screen options={{ title: dept?.short ?? 'Department' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          {dept ? <LetterMark letters={dept.code} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>{dept?.name ?? 'Department'}</Text>
            <Muted>{dept?.code} · pick a course</Muted>
          </View>
        </View>

        <View style={styles.filters}>
          <Pressable
            onPress={() => setLevelFilter(null)}
            style={[styles.filter, !levelFilter && styles.filterActive]}>
            <Text style={[styles.filterText, !levelFilter && styles.filterTextActive]}>
              All
            </Text>
          </Pressable>
          {levels.map((l) => {
            const active = levelFilter === l.id;
            return (
              <Pressable
                key={l.id}
                onPress={() => setLevelFilter(l.id)}
                style={[styles.filter, active && styles.filterActive]}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {l.id}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {courses.length === 0 ? (
          <Text style={styles.empty}>No courses in this filter (mock data).</Text>
        ) : (
          courses.map((c) => (
            <ListRow
              key={c.id}
              title={`${c.code} · ${c.name}`}
              subtitle={`Level ${c.level} · Sem ${c.semester} · ${c.materialCount} materials`}
              onPress={() => router.push(`/browse/course/${c.id}`)}
              right={<Text style={styles.chevron}>›</Text>}
            />
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Brand.bg },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  heading: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    color: Brand.text,
    marginBottom: 2,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  filter: {
    borderWidth: 1,
    borderColor: Brand.border,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Brand.bgCard,
  },
  filterActive: {
    borderColor: Brand.accent,
    backgroundColor: Brand.accentSoft,
  },
  filterText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Brand.textMuted,
  },
  filterTextActive: {
    color: Brand.accent,
  },
  empty: {
    fontFamily: 'DMSans_400Regular',
    color: Brand.textDim,
    marginTop: 24,
  },
  chevron: { color: Brand.textDim, fontSize: 22 },
});
