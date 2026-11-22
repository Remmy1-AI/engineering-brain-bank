import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Brand } from '@/constants/Colors';

const PILL_H = 56;
const INDICATOR = 40;
const SPRING = { damping: 20, stiffness: 220, mass: 0.8 };

/** Expo Router bottom-tab bar props (forked navigator — no classic `navigation`). */
type GlassTabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarAccessibilityLabel?: string;
        tabBarIcon?: (props: {
          focused: boolean;
          color: string;
          size: number;
        }) => React.ReactNode;
      };
    }
  >;
  navigateToTab: (routeKey: string) => void;
  insets: { bottom: number; top: number; left: number; right: number };
};

/**
 * Floating glass pill tab bar — icons only, gliding active indicator.
 */
export function GlassTabBar({
  state,
  descriptors,
  navigateToTab,
  insets,
}: GlassTabBarProps) {
  const [rowW, setRowW] = useState(0);
  const x = useSharedValue(0);

  const tabW = rowW > 0 ? rowW / state.routes.length : 0;
  const targetX =
    tabW > 0 ? state.index * tabW + (tabW - INDICATOR) / 2 : 0;

  useEffect(() => {
    x.value = withSpring(targetX, SPRING);
  }, [targetX, x]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.pillShadow}>
        <BlurView
          intensity={Platform.OS === 'android' ? 48 : 64}
          tint="light"
          style={styles.pill}>
          <View
            style={styles.pillInner}
            onLayout={(e) => setRowW(e.nativeEvent.layout.width)}>
            {rowW > 0 ? (
              <Animated.View
                pointerEvents="none"
                style={[styles.indicator, indicatorStyle]}
              />
            ) : null}
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const focused = state.index === index;
              // Solid gold pill → black icon for contrast; inactive stays muted
              const color = focused ? Brand.accentInk : Brand.textDim;
              const icon = options.tabBarIcon?.({
                focused,
                color,
                size: 22,
              });

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={focused ? { selected: true } : {}}
                  accessibilityLabel={
                    options.tabBarAccessibilityLabel ?? options.title ?? route.name
                  }
                  onPress={() => {
                    if (!focused) navigateToTab(route.key);
                  }}
                  style={styles.tab}>
                  {icon}
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  pillShadow: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 999,
    shadowColor: '#1A1A1A',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  pill: {
    height: PILL_H,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: Platform.select({
      web: 'rgba(255, 252, 247, 0.72)',
      default: 'rgba(255, 252, 247, 0.42)',
    }),
  },
  pillInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: (PILL_H - INDICATOR) / 2,
    width: INDICATOR,
    height: INDICATOR,
    borderRadius: INDICATOR / 2,
    backgroundColor: Brand.accent,
    borderWidth: 1,
    borderColor: Brand.accentPressed,
    shadowColor: Brand.accentPressed,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
