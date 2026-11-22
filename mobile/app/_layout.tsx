import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { BrandSplash } from '@/components/BrandSplash';
import { SplashAuth } from '@/components/SplashAuth';
import { Brand } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LibraryProvider } from '@/context/LibraryContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Brand.accent,
    background: Brand.bg,
    card: Brand.bgElevated,
    text: Brand.text,
    border: Brand.borderSubtle,
    notification: Brand.accent,
  },
};

function AuthGateOverlay() {
  const {
    isReady,
    isSignedIn,
    authGateOpen,
    closeAuthGate,
    authGatePhase,
    authGateSkipLand,
    bootResolved,
  } = useAuth();
  const [returningSplash, setReturningSplash] = useState(true);

  // Returning signed-in: brief splash, then Home (no force re-auth).
  useEffect(() => {
    if (!isReady || !bootResolved) return;
    if (!isSignedIn) {
      setReturningSplash(false);
      return;
    }
    const t = setTimeout(() => setReturningSplash(false), 900);
    return () => clearTimeout(t);
  }, [isReady, isSignedIn, bootResolved]);

  if (!isReady || !bootResolved) {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="auto">
        <BrandSplash />
      </View>
    );
  }

  if (isSignedIn && returningSplash) {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="auto">
        <BrandSplash />
      </View>
    );
  }

  if (authGateOpen && !isSignedIn) {
    return (
          <View
            style={[StyleSheet.absoluteFill, styles.gate]}
            pointerEvents="auto">
            <SplashAuth
              initialPhase={authGatePhase === 'signup' ? 'signup' : 'signin'}
              skipLand={authGateSkipLand || authGatePhase === 'signup'}
              onFinished={closeAuthGate}
            />
          </View>
    );
  }

  return null;
}

function RootNavigator() {
  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Brand.bg },
            headerTintColor: Brand.accent,
            headerShadowVisible: false,
            headerTitleStyle: {
              fontFamily: 'DMSans_700Bold',
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
        <AuthGateOverlay />
      </View>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <LibraryProvider>
        <ThemeProvider value={NavTheme}>
          <RootNavigator />
        </ThemeProvider>
      </LibraryProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.bg },
  gate: { zIndex: 100, elevation: 100, backgroundColor: Brand.bg },
});
