import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";

import BottomNavBar, { type TabKey } from "@/components/ui/bottom-nav-bar";

function MyTabBar({ state, navigation }: BottomTabBarProps) {
  const activeTab = state.routes[state.index].name as TabKey;

  return (
    <BottomNavBar
      activeTab={activeTab}
      onTabChange={(tab) => navigation.navigate(tab)}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="trips" options={{ href: null }} />
    </Tabs>
  );
}
