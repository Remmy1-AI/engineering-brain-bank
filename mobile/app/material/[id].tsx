import { Stack, router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Muted,
  PrimaryButton,
  SecondaryButton,
  TypePill,
} from '@/components/ui';
import { Brand } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useCatalog } from '@/context/CatalogContext';
import { useLibrary } from '@/context/LibraryContext';

export default function MaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCourse, getMaterial, getTypeMeta } = useCatalog();
  const material = getMaterial(id);
  const course = material ? getCourse(material.courseId) : undefined;
  const typeMeta = material ? getTypeMeta(material.type) : undefined;
  const { isSignedIn } = useAuth();
  const { isDownloaded, addDownload } = useLibrary();
  const [opening, setOpening] = useState(false);

  if (!material) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Material not found.</Text>
      </View>
    );
  }

  const openUrl = material.url || Brand.siteUrl;
  const downloaded = isDownloaded(material.id);

  async function onOpen() {
    setOpening(true);
    try {
      await WebBrowser.openBrowserAsync(openUrl, {
        toolbarColor: Brand.bg,
        controlsColor: Brand.accent,
      });
    } finally {
      setOpening(false);
    }
  }

  async function onDownload() {
    if (!isSignedIn) {
      Alert.alert(
        'Sign in required',
        'Download and Library save need phone OTP. Guests can still Open materials.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Profile',
            onPress: () => router.push('/(tabs)/profile'),
          },
        ]
      );
      return;
    }
    await addDownload(material!.id);
    Alert.alert('Saved to Library', 'This material is on your offline shelf (mock).');
  }

  async function onShare() {
    const m = material!;
    const message = `${m.title} — ${m.course_code}\n${openUrl}`;
    try {
      await Share.share({ message, url: openUrl, title: m.title });
    } catch {
      await Linking.openURL(openUrl);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: typeMeta?.name ?? 'Material' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {typeMeta ? (
          <TypePill type={material.type} label={typeMeta.name} />
        ) : null}
        <Text style={styles.title}>{material.title}</Text>
        <Muted>
          {material.course_code}
          {course ? ` · ${course.name}` : ''}
        </Muted>
        <Text style={styles.meta}>
          Level {material.level} · {material.downloads} opens
        </Text>
        <Text style={styles.path}>{material.file_path}</Text>

        <View style={styles.reader}>
          <Text style={styles.readerTitle}>Open in place</Text>
          <Text style={styles.readerBody}>
            Opens the material on boye.study. A quieter in-app reader ships when the live
            catalog is wired.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Open" onPress={onOpen} loading={opening} />
          <SecondaryButton
            label={downloaded ? 'Saved in Library' : 'Download'}
            onPress={onDownload}
            disabled={downloaded}
          />
          <SecondaryButton label="Share" onPress={onShare} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Brand.bg },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 24,
    color: Brand.text,
    marginTop: 10,
    marginBottom: 6,
  },
  meta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: Brand.textDim,
    marginTop: 8,
  },
  path: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Brand.textDim,
    marginTop: 6,
  },
  reader: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Brand.bgCard,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 12,
    minHeight: 140,
  },
  readerTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: Brand.text,
  },
  readerBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Brand.textMuted,
    marginTop: 8,
    lineHeight: 21,
  },
  actions: {
    marginTop: 24,
    gap: 10,
  },
  missing: {
    flex: 1,
    backgroundColor: Brand.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    fontFamily: 'DMSans_400Regular',
    color: Brand.textMuted,
  },
});
