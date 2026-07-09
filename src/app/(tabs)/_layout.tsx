import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/use-theme";

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
  const { t } = useTranslation();
  const theme = useTheme();

  if (Platform.OS === "ios") {
    return (
      <NativeTabs labelVisibilityMode="unlabeled" tintColor={theme.accent}>
        <NativeTabs.Trigger name="home">
          <NativeTabs.Trigger.Label>{t("nav.home")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="map">
          <NativeTabs.Trigger.Label>{t("nav.map")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "map", selected: "map.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="trips">
          <NativeTabs.Trigger.Label>{t("nav.trips")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "ticket", selected: "ticket.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>{t("nav.profile")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "person", selected: "person.fill" }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}