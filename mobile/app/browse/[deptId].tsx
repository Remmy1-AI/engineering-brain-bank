import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ListRow, Muted } from '@/components/ui';
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
        <Text style={styles.heading}>
          {dept ? `${dept.icon} ${dept.name}` : 'Department'}
        </Text>
        <Muted>{dept?.code} · pick a course</Muted>

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
  heading: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    color: Brand.text,
    marginBottom: 4,
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
    borderColor: Brand.borderSubtle,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: Brand.bgCard,
  },
  filterActive: {
    borderColor: Brand.gold,
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
  },
  filterText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: Brand.textMuted,
  },
  filterTextActive: {
    color: Brand.gold,
  },
  empty: {
    fontFamily: 'DMSans_400Regular',
    color: Brand.textDim,
    marginTop: 24,
  },
  chevron: { color: Brand.gold, fontSize: 22 },
});
