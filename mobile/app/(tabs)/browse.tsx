import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GoldLabel, ListRow, Subtitle, Title } from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { departments, levels } from '@/data/mockCatalog';

export default function BrowseScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <GoldLabel>{Brand.parentBrand}</GoldLabel>
      <Title>Browse</Title>
      <Subtitle>Department → course → materials. Guests can open anything.</Subtitle>

      <Text style={styles.section}>Departments</Text>
      {departments.map((d) => (
        <ListRow
          key={d.id}
          title={`${d.icon}  ${d.name}`}
          subtitle={`${d.code} · ${d.count} materials (mock)`}
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
        Pick a department to filter courses by level inside the course list.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Brand.bg },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  section: {
    fontFamily: 'Syne_700Bold',
    fontSize: 16,
    color: Brand.text,
    marginTop: 24,
    marginBottom: 4,
  },
  chevron: {
    color: Brand.gold,
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
    borderColor: Brand.borderSubtle,
    backgroundColor: Brand.bgCard,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
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
