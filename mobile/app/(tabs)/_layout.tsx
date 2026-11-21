import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { GlassTabBar } from '@/components/GlassTabBar';
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
      size={22}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Brand.accent,
        tabBarInactiveTintColor: Brand.textDim,
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
