import {
    BriefcaseBusiness,
    Compass,
    House,
    Map,
    UserRound,
} from "lucide-react-native";
import React, { useRef } from "react";
import {
    Animated,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const iconColor = (active: boolean) => (active ? "#132017" : "#9aaa9a");

const iconStroke = (active: boolean) => (active ? 2.7 : 2.2);

const HomeIcon = ({ active }: { active: boolean }) => (
  <House size={24} color={iconColor(active)} strokeWidth={iconStroke(active)} />
);

const ExploreIcon = ({ active }: { active: boolean }) => (
  <Compass
    size={24}
    color={iconColor(active)}
    strokeWidth={iconStroke(active)}
  />
);

const MapIcon = ({ active }: { active: boolean }) => (
  <Map size={24} color={iconColor(active)} strokeWidth={iconStroke(active)} />
);

const TripsIcon = ({ active }: { active: boolean }) => (
  <BriefcaseBusiness
    size={24}
    color={iconColor(active)}
    strokeWidth={iconStroke(active)}
  />
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <UserRound
    size={24}
    color={iconColor(active)}
    strokeWidth={iconStroke(active)}
  />
);

type TabKey = "home" | "explore" | "map" | "trips" | "profile";

interface Tab {
  key: TabKey;
  label: string;
  Icon: React.FC<{ active: boolean }>;
}

const TABS: Tab[] = [
  { key: "home", label: "Home", Icon: HomeIcon },
  { key: "explore", label: "Explore", Icon: ExploreIcon },
  { key: "map", label: "Map", Icon: MapIcon },
  { key: "trips", label: "Trips", Icon: TripsIcon },
  { key: "profile", label: "Profile", Icon: ProfileIcon },
];

interface NavItemProps {
  tab: Tab;
  active: boolean;
  onPress: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ tab, active, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { Icon } = tab;

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
      android_disableSound={true}
      android_ripple={null}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: active }}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Icon active={active} />
      </Animated.View>

      <Text style={[styles.label, active && styles.labelActive]}>
        {tab.label}
      </Text>
    </Pressable>
  );
};

interface BottomNavBarProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab: controlledTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();

  const [internalTab, setInternalTab] = React.useState<TabKey>("home");

  const activeTab = controlledTab ?? internalTab;

  const handleTabChange = (tab: TabKey) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  return (
    <View
      style={[
        styles.container,
        {
          bottom: insets.bottom > 0 ? insets.bottom : 16,
        },
      ]}
    >
      {TABS.map((tab) => (
        <NavItem
          key={tab.key}
          tab={tab}
          active={activeTab === tab.key}
          onPress={() => handleTabChange(tab.key)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",

    left: 20,
    right: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#F5F0E8",

    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 12,

    borderRadius: 28,

    borderWidth: 1,
    borderColor: "rgba(26,58,42,0.06)",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.08,
    shadowRadius: 20,

    elevation: 10,
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

    borderRadius: 12,
  },

  label: {
    fontSize: 10.5,
    fontWeight: "500",

    color: "#9aaa9a",

    letterSpacing: 0.15,

    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "sans-serif",
    }),
  },

  labelActive: {
    color: "#132017",
    fontWeight: "700",
  },
});

export default BottomNavBar;
export type { BottomNavBarProps, TabKey };

