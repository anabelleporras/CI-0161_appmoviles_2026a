// src/app/(tabs)/home.tsx

import * as Location from "expo-location";
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
import Svg, { Path } from "react-native-svg";

function LeafDecor({
  size = 120,
  opacity = 0.07,
}: {
  size?: number;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" style={{ opacity }}>
      <Path
        d="M60 10 C60 10 100 30 100 70 C100 95 82 110 60 110 C38 110 20 95 20 70 C20 30 60 10 60 10Z"
        fill="#1A2B1E"
      />
      <Path
        d="M60 110 C60 110 60 50 60 10"
        stroke="#F7F5F0"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M60 70 C60 70 40 55 30 45"
        stroke="#F7F5F0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M60 80 C60 80 80 65 90 55"
        stroke="#F7F5F0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M60 58 C60 58 42 46 34 38"
        stroke="#F7F5F0"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TripCard({
  title,
  subtitle,
  tag,
  delay,
}: {
  title: string;
  subtitle: string;
  tag: string;
  delay: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.tripCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.tripCardInner}>
        <View style={styles.tripCardLeft}>
          <Text style={styles.tripTag}>{tag}</Text>
          <Text style={styles.tripTitle}>{title}</Text>
          <Text style={styles.tripSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.tripArrow}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12H19M13 6L19 12L13 18"
              stroke="#1A2B1E"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(24)).current;

  const [locationLabel, setLocationLabel] = useState("Loading...");

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationLabel("Location denied");
          return;
        }

        let currentLocation;

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

        console.log(currentLocation);

        const address = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (address.length > 0) {
          const place = address[0];

          const city =
            place.city || place.region || place.subregion || "Unknown";

          const countryCode = place.isoCountryCode || "";

          setLocationLabel(`${city}, ${countryCode}`);
        }
      } catch (error) {
        console.log(error);
        setLocationLabel("Location unavailable");
      }
    };

    getLocation();
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: heroFade,
              transform: [{ translateY: heroSlide }],
            },
          ]}
        >
          <View style={styles.leafTopRight}>
            <LeafDecor size={180} opacity={0.06} />
          </View>

          <View style={styles.leafBottomLeft}>
            <LeafDecor size={130} opacity={0.05} />
          </View>

          {/* LOCATION CAPSULE */}
          <View style={styles.locationCapsule}>
            <Text style={styles.locationText}>{locationLabel}</Text>
          </View>

          <Text style={styles.greeting}>GOOD MORNING</Text>

          <Text style={styles.heroHeadline}>Where will{"\n"}you wander?</Text>

          <View style={styles.statsRow}>
            <StatPill value="3" label="Trips planned" />

            <View style={styles.statDivider} />

            <StatPill value="12" label="Places saved" />

            <View style={styles.statDivider} />

            <StatPill value="4" label="Countries" />
          </View>
        </Animated.View>

        {/* UPCOMING TRIPS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Trips</Text>

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>

          <TripCard
            title="Kyoto in Autumn"
            subtitle="Nov 12 – Nov 22 · Japan"
            tag="IN 18 DAYS"
            delay={100}
          />

          <TripCard
            title="Patagonia Trek"
            subtitle="Feb 3 – Feb 17 · Argentina"
            tag="PLANNING"
            delay={200}
          />
        </View>

        {/* DISCOVER */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.discoverRow}
          >
            {[
              { place: "Lisbon", country: "Portugal", emoji: "🌊" },
              { place: "Tbilisi", country: "Georgia", emoji: "🏔️" },
              { place: "Oaxaca", country: "Mexico", emoji: "🌿" },
              { place: "Chiang Mai", country: "Thailand", emoji: "🕌" },
            ].map((item) => (
              <TouchableOpacity
                key={item.place}
                style={styles.discoverCard}
                activeOpacity={0.82}
              >
                <Text style={styles.discoverEmoji}>{item.emoji}</Text>

                <Text style={styles.discoverPlace}>{item.place}</Text>

                <Text style={styles.discoverCountry}>{item.country}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F5F0",
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 32,
  },

  hero: {
    paddingHorizontal: 28,
    paddingTop: 32,
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E5DE",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 18,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A2B1E",
    letterSpacing: 0.2,
  },

  greeting: {
    fontSize: 11,
    letterSpacing: 2.5,
    color: "#1A2B1E",
    opacity: 0.45,
    marginBottom: 12,
    fontWeight: "500",
  },

  heroHeadline: {
    fontSize: 46,
    fontWeight: "800",
    color: "#1A2B1E",
    lineHeight: 52,
    letterSpacing: -1,
    marginBottom: 32,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2B1E",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },

  statPill: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F7F5F0",
    letterSpacing: -0.5,
  },

  statLabel: {
    fontSize: 10,
    color: "#F7F5F0",
    opacity: 0.55,
    marginTop: 2,
    letterSpacing: 0.3,
    textAlign: "center",
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#F7F5F0",
    opacity: 0.15,
  },

  section: {
    paddingHorizontal: 28,
    marginTop: 8,
    marginBottom: 8,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A2B1E",
    letterSpacing: -0.3,
  },

  sectionLink: {
    fontSize: 13,
    color: "#1A2B1E",
    opacity: 0.45,
    fontWeight: "500",
  },

  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8E5DE",
  },

  tripCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  tripCardLeft: {
    flex: 1,
  },

  tripTag: {
    fontSize: 9.5,
    letterSpacing: 1.5,
    color: "#1A2B1E",
    opacity: 0.45,
    fontWeight: "600",
    marginBottom: 5,
  },

  tripTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2B1E",
    marginBottom: 3,
    letterSpacing: -0.2,
  },

  tripSubtitle: {
    fontSize: 13,
    color: "#1A2B1E",
    opacity: 0.5,
  },

  tripArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F5F0",
    alignItems: "center",
    justifyContent: "center",
  },

  discoverRow: {
    gap: 12,
    paddingRight: 28,
  },

  discoverCard: {
    width: 120,
    backgroundColor: "#1A2B1E",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 14,
  },

  discoverEmoji: {
    fontSize: 28,
    marginBottom: 12,
  },

  discoverPlace: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F7F5F0",
    marginBottom: 2,
    letterSpacing: -0.2,
  },

  discoverCountry: {
    fontSize: 11,
    color: "#F7F5F0",
    opacity: 0.5,
  },
});
