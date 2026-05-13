import * as Location from "expo-location";
import { ChevronRight, Leaf } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Radius, Shadow, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Theme = ReturnType<typeof useTheme>;

function LeafDecor({ size = 120, opacity = 0.07, color }: { size?: number; opacity?: number; color: string }) {
  return <Leaf size={size} color={color} strokeWidth={1.5} style={{ opacity }} />;
}

function StatPill({ value, label, theme }: { value: string; label: string; theme: Theme }) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color: theme.textInverse }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textInverse }]}>{label}</Text>
    </View>
  );
}

function TripCard({
  title,
  subtitle,
  tag,
  delay,
  theme,
}: {
  title: string;
  subtitle: string;
  tag: string;
  delay: number;
  theme: Theme;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.tripCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.tripCardInner}>
        <View style={styles.tripCardLeft}>
          <Text style={[styles.tripTag, { color: theme.text }]}>{tag}</Text>
          <Text style={[styles.tripTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.tripSubtitle, { color: theme.text }]}>{subtitle}</Text>
        </View>

        <View style={[styles.tripArrow, { backgroundColor: theme.background }]}>
          <ChevronRight size={18} color={theme.icon} strokeWidth={2} />
        </View>
      </View>
    </Animated.View>
  );
}

const DISCOVER_ITEMS = [
  { place: "Lisbon", country: "Portugal", emoji: "🌊" },
  { place: "Tbilisi", country: "Georgia", emoji: "🏔️" },
  { place: "Oaxaca", country: "Mexico", emoji: "🌿" },
  { place: "Chiang Mai", country: "Thailand", emoji: "🕌" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(24)).current;

  const [locationLabel, setLocationLabel] = useState("Loading...");

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationLabel("Location denied");
          return;
        }

        let currentLocation: Location.LocationObject | null;
        try {
          currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
        } catch {
          currentLocation = await Location.getLastKnownPositionAsync();
        }

        if (!currentLocation) {
          setLocationLabel("No GPS signal");
          return;
        }

        const address = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (address.length > 0) {
          const place = address[0];
          const city = place.city || place.region || place.subregion || "Unknown";
          const countryCode = place.isoCountryCode || "";
          setLocationLabel(`${city}, ${countryCode}`);
        }
      } catch (error) {
        console.log(error);
        setLocationLabel("Location unavailable");
      }
    };

    getLocation();
  }, [heroFade, heroSlide]);

  return (
    <View
      style={[styles.root, { backgroundColor: theme.background, paddingTop: insets.top }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.hero,
            { opacity: heroFade, transform: [{ translateY: heroSlide }] },
          ]}
        >
          <View style={styles.leafTopRight}>
            <LeafDecor size={180} opacity={0.06} color={theme.icon} />
          </View>
          <View style={styles.leafBottomLeft}>
            <LeafDecor size={130} opacity={0.05} color={theme.icon} />
          </View>

          <View
            style={[
              styles.locationCapsule,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.locationText, { color: theme.text }]}>
              {locationLabel}
            </Text>
          </View>

          <Text style={[styles.greeting, { color: theme.text }]}>GOOD MORNING</Text>

          <Text style={[styles.heroHeadline, { color: theme.text }]}>
            Where will{"\n"}you wander?
          </Text>

          <View style={[styles.statsRow, { backgroundColor: theme.surfaceInverse }]}>
            <StatPill value="3" label="Trips planned" theme={theme} />
            <View style={[styles.statDivider, { backgroundColor: theme.textInverse }]} />
            <StatPill value="12" label="Places saved" theme={theme} />
            <View style={[styles.statDivider, { backgroundColor: theme.textInverse }]} />
            <StatPill value="4" label="Countries" theme={theme} />
          </View>
        </Animated.View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Trips</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.sectionLink, { color: theme.text }]}>See all</Text>
            </TouchableOpacity>
          </View>

          <TripCard
            title="Kyoto in Autumn"
            subtitle="Nov 12 – Nov 22 · Japan"
            tag="IN 18 DAYS"
            delay={100}
            theme={theme}
          />
          <TripCard
            title="Patagonia Trek"
            subtitle="Feb 3 – Feb 17 · Argentina"
            tag="PLANNING"
            delay={200}
            theme={theme}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Discover</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.discoverRow}
          >
            {DISCOVER_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.place}
                style={[styles.discoverCard, { backgroundColor: theme.surfaceInverse }]}
                activeOpacity={0.82}
              >
                <Text style={styles.discoverEmoji}>{item.emoji}</Text>
                <Text style={[styles.discoverPlace, { color: theme.textInverse }]}>
                  {item.place}
                </Text>
                <Text style={[styles.discoverCountry, { color: theme.textInverse }]}>
                  {item.country}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  hero: {
    paddingHorizontal: 28,
    paddingTop: Spacing["2xl"],
    paddingBottom: 36,
    overflow: "hidden",
  },
  leafTopRight: {
    position: "absolute",
    top: -20,
    right: -30,
    transform: [{ rotate: "30deg" }],
  },
  leafBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: -20,
    transform: [{ rotate: "-20deg" }],
  },

  locationCapsule: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    marginBottom: 18,
    ...Shadow.pill,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  greeting: {
    fontSize: 11,
    letterSpacing: 2.5,
    opacity: 0.45,
    marginBottom: Spacing.md,
    fontWeight: "500",
  },
  heroHeadline: {
    ...Typography.title1,
    fontSize: 46,
    lineHeight: 52,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: Spacing["2xl"],
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.xl,
    paddingVertical: 18,
    paddingHorizontal: Spacing.xl,
  },
  statPill: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.55,
    marginTop: 2,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 32,
    opacity: 0.15,
  },

  section: {
    paddingHorizontal: 28,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 14,
  },
  sectionTitle: {
    ...Typography.subtitle,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontSize: 13,
    opacity: 0.45,
    fontWeight: "500",
  },

  tripCard: {
    borderRadius: Radius.lg,
    marginBottom: 10,
    borderWidth: 1,
  },
  tripCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  tripCardLeft: { flex: 1 },
  tripTag: {
    fontSize: 9.5,
    letterSpacing: 1.5,
    opacity: 0.45,
    fontWeight: "600",
    marginBottom: 5,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  tripSubtitle: {
    fontSize: 13,
    opacity: 0.5,
  },
  tripArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  discoverRow: { gap: Spacing.md, paddingRight: 28 },
  discoverCard: {
    width: 120,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: 14,
  },
  discoverEmoji: { fontSize: 28, marginBottom: Spacing.md },
  discoverPlace: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  discoverCountry: {
    fontSize: 11,
    opacity: 0.5,
  },

  bottomSpacer: { height: Spacing.xl },
});
