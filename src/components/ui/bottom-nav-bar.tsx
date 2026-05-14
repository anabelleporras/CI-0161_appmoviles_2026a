import {
  House,
  Map,
  UserRound,
  type LucideIcon,
} from "lucide-react-native";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Radius, Shadow, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type TabKey = "home" | "map" | "profile";

type Tab = {
  key: TabKey;
  label: string;
  Icon: LucideIcon;
};

const TABS: Tab[] = [
  { key: "home", label: "Home", Icon: House },
  { key: "map", label: "Map", Icon: Map },
  { key: "profile", label: "Profile", Icon: UserRound },
];

type NavItemProps = {
  tab: Tab;
  active: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
};

const NavItem: React.FC<NavItemProps> = ({
  tab,
  active,
  activeColor,
  inactiveColor,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { Icon } = tab;
  const color = active ? activeColor : inactiveColor;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Pressable
      style={styles.navItem}
      onPress={handlePress}
      android_disableSound
      android_ripple={null}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: active }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Icon size={24} color={color} strokeWidth={active ? 2.6 : 2.2} />
      </Animated.View>
    </Pressable>
  );
};

export type BottomNavBarProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          bottom: insets.bottom > 0 ? insets.bottom : Spacing.lg,
          backgroundColor: theme.tabBarBackground,
          borderColor: theme.border,
        },
      ]}
    >
      {TABS.map((tab) => (
        <NavItem
          key={tab.key}
          tab={tab}
          active={activeTab === tab.key}
          activeColor={theme.tabBarIconActive}
          inactiveColor={theme.tabBarIconInactive}
          onPress={() => onTabChange(tab.key)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1,
    overflow: "hidden",
    ...Shadow.navbar,
  },
  navItem: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BottomNavBar;
