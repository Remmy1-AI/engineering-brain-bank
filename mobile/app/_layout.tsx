import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { BrandSplash } from '@/components/BrandSplash';
import { AuthProvider } from '@/context/AuthContext';
import { LibraryProvider } from '@/context/LibraryContext';
import { Brand } from '@/constants/Colors';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Brand.gold,
    background: Brand.bg,
    card: Brand.bgElevated,
    text: Brand.text,
    border: Brand.borderSubtle,
    notification: Brand.gold,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Syne_700Bold,
    Syne_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  const [showBrandSplash, setShowBrandSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => setShowBrandSplash(false), 1600);
    return () => clearTimeout(t);
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <LibraryProvider>
        <ThemeProvider value={NavTheme}>
          <StatusBar style="light" />
          <View style={styles.root}>
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: Brand.bgElevated },
                headerTintColor: Brand.gold,
                headerTitleStyle: {
                  fontFamily: 'Syne_700Bold',
                  color: Brand.text,
                },
                contentStyle: { backgroundColor: Brand.bg },
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="browse/[deptId]"
                options={{ title: 'Department', headerBackTitle: 'Browse' }}
              />
              <Stack.Screen
                name="browse/course/[courseId]"
                options={{ title: 'Course', headerBackTitle: 'Back' }}
              />
              <Stack.Screen
                name="material/[id]"
                options={{ title: 'Material', presentation: 'card' }}
              />
            </Stack>
            {showBrandSplash ? (
              <View style={StyleSheet.absoluteFill} pointerEvents="auto">
                <BrandSplash />
              </View>
            ) : null}
          </View>
        </ThemeProvider>
      </LibraryProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
});
