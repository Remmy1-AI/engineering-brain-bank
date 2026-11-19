import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LetterMark, ListRow, Subtitle, Title } from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { departments, levels } from '@/data/mockCatalog';

export default function BrowseScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.appWordmark}>{Brand.appName}</Text>
      <Title>Browse</Title>
      <Subtitle>Department → course → materials. Guests can open anything.</Subtitle>

      <Text style={styles.section}>Departments</Text>
      {departments.map((d) => (
        <ListRow
          key={d.id}
          title={d.name}
          subtitle={`${d.code} · ${d.count} materials`}
          leading={<LetterMark letters={d.code} />}
          onPress={() => router.push(`/browse/${d.id}`)}
          right={<Text style={styles.chevron}>›</Text>}
        />
      ))}

      <Text style={styles.section}>Levels</Text>
      <View style={styles.levelRow}>
        {levels.map((l) => (
          <View key={l.id} style={styles.levelChip}>
            <Text style={styles.levelText}>{l.name}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.hint}>
        Open a department to filter courses by level.
      </Text>
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
  section: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Brand.text,
    marginTop: 26,
    marginBottom: 4,
  },
  chevron: {
    color: Brand.textDim,
    fontSize: 22,
    fontFamily: 'DMSans_400Regular',
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  levelChip: {
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.bgCard,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  levelText: {
    fontFamily: 'DMSans_500Medium',
    color: Brand.textMuted,
    fontSize: 13,
  },
  hint: {
    fontFamily: 'DMSans_400Regular',
    color: Brand.textDim,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },
});
