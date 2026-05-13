import {
  BriefcaseBusiness,
  Compass,
  House,
  Map,
  UserRound,
  type LucideIcon,
} from "lucide-react-native";
import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type TabKey = "home" | "explore" | "map" | "trips" | "profile";

type Tab = {
  key: TabKey;
  label: string;
  Icon: LucideIcon;
};

const TABS: Tab[] = [
  { key: "home", label: "Home", Icon: House },
  { key: "explore", label: "Explore", Icon: Compass },
  { key: "map", label: "Map", Icon: Map },
  { key: "trips", label: "Trips", Icon: BriefcaseBusiness },
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
        toValue: 0.88,
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
      <Animated.View
        style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}
      >
        <Icon size={24} color={color} strokeWidth={active ? 2.7 : 2.2} />
      </Animated.View>
      <Text
        style={[
          styles.label,
          { color: inactiveColor },
          active && { color: activeColor, fontWeight: "700" },
        ]}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
};

export type BottomNavBarProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
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
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius["2xl"],
    borderWidth: 1,
    ...Shadow.navbar,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
  label: {
    ...Typography.body4,
    letterSpacing: 0.15,
    fontWeight: "500",
  },
});

export default BottomNavBar;
