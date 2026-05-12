// src/app/(tabs)/_layout.tsx  ← TABS LAYOUT (inside tabs folder)
import { Tabs } from "expo-router";
import BottomNavBar, { TabKey } from "../../components/ui/bottomNavBar";

const TAB_KEYS: TabKey[] = ["home", "explore", "map", "trips", "profile"];

function MyTabBar({ state, navigation }: any) {
  const activeTab = TAB_KEYS[state.index] ?? "home";

  return (
    <BottomNavBar
      activeTab={activeTab}
      onTabChange={(tab) => {
        const index = TAB_KEYS.indexOf(tab);
        if (index !== -1) navigation.navigate(TAB_KEYS[index]);
      }}
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
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
