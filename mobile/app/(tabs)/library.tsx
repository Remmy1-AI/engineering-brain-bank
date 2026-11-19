import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import {
  EmptyState,
  GoldLabel,
  ListRow,
  PrimaryButton,
  Subtitle,
  Title,
} from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { getMaterial } from '@/data/mockCatalog';

export default function LibraryScreen() {
  const { isSignedIn } = useAuth();
  const { downloads, removeDownload } = useLibrary();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <GoldLabel>{Brand.parentBrand}</GoldLabel>
      <Title>Library</Title>
      <Subtitle>Your offline shelf — downloads saved on this device.</Subtitle>

      {!isSignedIn ? (
        <EmptyState
          title="Sign in to save downloads"
          body="Guests can browse and open materials. Phone OTP unlocks downloads and this shelf."
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
          body="Open a material and tap Download to add it here."
          action={
            <PrimaryButton label="Browse catalog" onPress={() => router.push('/(tabs)/browse')} />
          }
        />
      ) : (
        <>
          <Text style={styles.count}>{downloads.length} saved</Text>
          {downloads.map((d) => {
            const m = getMaterial(d.materialId);
            if (!m) return null;
            return (
              <ListRow
                key={d.materialId}
                title={m.title}
                subtitle={`${m.course_code} · ${m.topic}`}
                meta={`Saved ${new Date(d.savedAt).toLocaleDateString()}`}
                onPress={() => router.push(`/material/${m.id}`)}
                right={
                  <Text
                    style={styles.remove}
                    onPress={() => removeDownload(d.materialId)}>
                    Remove
                  </Text>
                }
              />
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Brand.bg },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  count: {
    fontFamily: 'DMSans_400Regular',
    color: Brand.textDim,
    marginTop: 20,
    marginBottom: 4,
    fontSize: 13,
  },
  remove: {
    fontFamily: 'DMSans_500Medium',
    color: Brand.textDim,
    fontSize: 12,
    padding: 6,
  },
});
