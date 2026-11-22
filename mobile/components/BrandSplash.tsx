import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/Colors';

/** Wordmark splash: Brain Bank centered; credit at bottom with open space above. No crest. */
export function BrandSplash() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingBottom: Math.max(insets.bottom, 32), paddingTop: insets.top },
      ]}>
      <View style={styles.center}>
        <Text style={styles.parent}>{Brand.parentBrand}</Text>
        <Text style={styles.name}>{Brand.appName}</Text>
        <Text style={styles.tagline}>{Brand.tagline}</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.credit}>{Brand.splashCredit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    minHeight: '100%' as unknown as number,
    backgroundColor: Brand.bg,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  parent: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: Brand.accent,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 40,
    color: Brand.text,
    letterSpacing: -0.6,
  },
  tagline: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Brand.textMuted,
    marginTop: 2,
  },
  bottom: {
    alignItems: 'center',
    paddingTop: 48,
  },
  credit: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: Brand.textDim,
  },
});
