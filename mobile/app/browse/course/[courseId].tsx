import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ListRow, Muted, TypePill } from '@/components/ui';
import { Brand } from '@/constants/Colors';
import {
  getCourse,
  getDepartment,
  getMaterialsByCourse,
  getTypeMeta,
  materialTypes,
} from '@/data/mockCatalog';

export default function CourseScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const course = getCourse(courseId);
  const materials = getMaterialsByCourse(courseId);
  const dept = course ? getDepartment(course.department) : undefined;

  const byType = useMemo(() => {
    return materialTypes
      .map((t) => ({
        type: t,
        items: materials.filter((m) => m.type === t.id),
      }))
      .filter((g) => g.items.length > 0);
  }, [materials]);

  return (
    <>
      <Stack.Screen options={{ title: course?.code ?? 'Course' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{course?.name ?? 'Course'}</Text>
        <Muted>
          {course?.code}
          {dept ? ` · ${dept.name}` : ''}
          {course ? ` · Level ${course.level}` : ''}
        </Muted>
        {course?.description ? (
          <Text style={styles.desc}>{course.description}</Text>
        ) : null}

        {byType.length === 0 ? (
          <Text style={styles.empty}>No materials yet.</Text>
        ) : (
          byType.map((group) => (
            <View key={group.type.id}>
              <View style={styles.typeHeader}>
                <TypePill type={group.type.id} label={group.type.name} />
              </View>
              {group.items.map((m) => (
                <ListRow
                  key={m.id}
                  title={m.title}
                  subtitle={getTypeMeta(m.type)?.name}
                  meta={`${m.downloads} opens`}
                  onPress={() => router.push(`/material/${m.id}`)}
                  right={<Text style={styles.chevron}>›</Text>}
                />
              ))}
            </View>
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
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    color: Brand.text,
    marginBottom: 4,
  },
  desc: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Brand.textMuted,
    marginTop: 12,
    lineHeight: 21,
  },
  typeHeader: {
    marginTop: 24,
    marginBottom: 4,
  },
  empty: {
    fontFamily: 'DMSans_400Regular',
    color: Brand.textDim,
    marginTop: 24,
  },
  chevron: { color: Brand.textDim, fontSize: 22 },
});
