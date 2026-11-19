import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Brand } from '@/constants/Colors';

function TabIcon({
  ios,
  android,
  color,
}: {
  ios: string;
  android: string;
  color: string | undefined;
}) {
  return (
    <SymbolView
      name={{
        ios: ios as any,
        android: android as any,
        web: android as any,
      }}
      tintColor={color ?? Brand.accent}
      size={24}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.accent,
        tabBarInactiveTintColor: Brand.textDim,
        tabBarStyle: {
          backgroundColor: Brand.bgElevated,
          borderTopColor: Brand.borderSubtle,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon ios="house.fill" android="home" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => (
            <TabIcon ios="square.grid.2x2.fill" android="grid_view" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <TabIcon ios="books.vertical.fill" android="menu_book" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabIcon ios="person.fill" android="person" color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
