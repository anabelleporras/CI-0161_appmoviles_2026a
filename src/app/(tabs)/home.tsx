import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { ChevronRight, Leaf } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

function LeafDecor({
  size = 120,
  opacity = 0.07,
  color,
}: {
  size?: number;
  opacity?: number;
  color: string;
}) {
  return (
    <Leaf size={size} color={color} strokeWidth={1.5} style={{ opacity }} />
  );
}

function StatPill({
  value,
  label,
  theme,
}: {
  value: string;
  label: string;
  theme: Theme;
}) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color: theme.textInverse }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.textInverse }]}>
        {label}
      </Text>
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
          <Text style={[styles.tripSubtitle, { color: theme.text }]}>
            {subtitle}
          </Text>
        </View>
        <View style={[styles.tripArrow, { backgroundColor: theme.background }]}>
          <ChevronRight size={18} color={theme.icon} strokeWidth={2} />
        </View>
      </View>
    </Animated.View>
  );
}

const filters = [
  { id: "beach", label: "Beaches", query: "natural=beach", radius: 100000 },
  { id: "park", label: "Parks", query: "leisure=park", radius: 10000 },
  { id: "lodging", label: "Lodges", query: "tourism=hotel", radius: 50000 },
  {
    id: "restaurant",
    label: "Food",
    query: "amenity=restaurant",
    radius: 5000,
  },
  {
    id: "tourist_attraction",
    label: "Explore",
    query: "tourism=attraction",
    radius: 10000,
  },
];

const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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
  const requestIdRef = useRef(0);

  const [locationLabel, setLocationLabel] = useState("Loading...");
  const [userName, setUserName] = useState("");
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);

  const featuredPlace = places[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "GOOD EVENING";
    if (hour >= 5 && hour < 12) greeting = "GOOD MORNING";
    else if (hour >= 12 && hour < 18) greeting = "GOOD AFTERNOON";
    return userName ? `${greeting}, ${userName.toUpperCase()}` : greeting;
  };

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

    getLocation();
    loadUser();
  }, []);

  useEffect(() => {
    if (!coords) return;
    fetchNearbyPlaces(
      coords.latitude,
      coords.longitude,
      selectedFilter.query,
      selectedFilter.radius,
    );
  }, [coords, selectedFilter]);

  const loadUser = async () => {
    try {
      const storedName = await SecureStore.getItemAsync("user_name");
      if (storedName) {
        const firstName = storedName.split(" ")[0];
        setUserName(firstName);
      }
    } catch (error) {
      console.log("Failed to load user", error);
    }
  };

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

      const { latitude, longitude } = currentLocation.coords;
      setCoords({ latitude, longitude });

      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
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

  const fetchNearbyPlaces = async (
    latitude: number,
    longitude: number,
    tagQuery: string,
    radius: number = 5000,
  ) => {
    const currentRequestId = ++requestIdRef.current;
    try {
      setLoadingPlaces(true);
      const query = `
        [out:json][timeout:25];
        (
          node[${tagQuery}](around:${radius},${latitude},${longitude});
          way[${tagQuery}](around:${radius},${latitude},${longitude});
        );
        out center 20;
      `;
      const mirror = "https://overpass.kumi.systems/api/interpreter";
      const res = await fetch(mirror, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
      });

      const text = await res.text();
      if (!text.startsWith("{")) return;

      const data = JSON.parse(text);
      const formatted = data.elements
        .filter((item: any) => item.tags?.name)
        .map((item: any) => {
          const placeLat = item.lat ?? item.center?.lat;
          const placeLon = item.lon ?? item.center?.lon;
          const distance = calculateDistanceKm(
            latitude,
            longitude,
            placeLat,
            placeLon,
          );
          return {
            id: item.id,
            name: item.tags.name,
            type:
              item.tags.tourism ||
              item.tags.leisure ||
              item.tags.amenity ||
              item.tags.natural,
            latitude: placeLat,
            longitude: placeLon,
            distance: distance.toFixed(1),
          };
        })
        .slice(0, 50);

      if (currentRequestId !== requestIdRef.current) return;
      setPlaces(formatted);
    } catch (error) {
      console.log("fetchNearbyPlaces error:", error);
    } finally {
      if (currentRequestId === requestIdRef.current) setLoadingPlaces(false);
    }
  };

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
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

          <Text style={[styles.greeting, { color: theme.text }]}>
            {getGreeting()}
          </Text>

          <Text style={[styles.heroHeadline, { color: theme.text }]}>
            What calls to you{"\n"}today?
          </Text>

          <View
            style={[styles.statsRow, { backgroundColor: theme.surfaceInverse }]}
          >
            <StatPill value="3" label="Trips planned" theme={theme} />
            <View
              style={[
                styles.statDivider,
                { backgroundColor: theme.textInverse },
              ]}
            />
            <StatPill value="12" label="Places saved" theme={theme} />
            <View
              style={[
                styles.statDivider,
                { backgroundColor: theme.textInverse },
              ]}
            />
            <StatPill value="4" label="Countries" theme={theme} />
          </View>
        </Animated.View>

        {/* UPCOMING TRIPS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Upcoming Trips
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.sectionLink, { color: theme.text }]}>
                See all
              </Text>
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

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {filters.map((filter) => {
            const active = selectedFilter.id === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                activeOpacity={0.85}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  active && {
                    backgroundColor: theme.surfaceInverse,
                    borderColor: theme.surfaceInverse,
                  },
                ]}
                onPress={() => {
                  setPlaces([]);
                  setLoadingPlaces(true);
                  setSelectedFilter(filter);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: theme.text },
                    active && { color: theme.textInverse },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FEATURED PLACE */}
        <View style={styles.section}>
          {loadingPlaces ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.text} />
            </View>
          ) : featuredPlace ? (
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.featuredCard,
                { backgroundColor: theme.surfaceInverse },
              ]}
            >
              <Text style={[styles.featuredTag, { color: theme.textInverse }]}>
                EDITOR'S PICK · TODAY
              </Text>
              <Text
                style={[styles.featuredTitle, { color: theme.textInverse }]}
              >
                {featuredPlace.name}
              </Text>
              <Text
                style={[styles.featuredSubtitle, { color: theme.textInverse }]}
              >
                Discover nearby hidden gems and curated experiences around you.
              </Text>
              <Text style={styles.featuredType}>
                {featuredPlace.type} · {featuredPlace.distance} km away
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No places found nearby.
            </Text>
          )}
        </View>

        {/* NEARBY PLACES */}
        {!loadingPlaces && places.length > 1 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Discover Nearby
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.discoverRow}
            >
              {places.slice(1).map((place: any) => (
                <TouchableOpacity
                  key={place.id}
                  activeOpacity={0.85}
                  style={[
                    styles.discoverCard,
                    { backgroundColor: theme.surfaceInverse },
                  ]}
                >
                  <Text
                    style={[styles.discoverPlace, { color: theme.textInverse }]}
                  >
                    {place.name}
                  </Text>
                  <Text
                    style={[
                      styles.discoverCountry,
                      { color: theme.textInverse },
                    ]}
                  >
                    {place.type} · {place.distance} km
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* DISCOVER (static) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Discover
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.discoverRow}
          >
            {DISCOVER_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.place}
                style={[
                  styles.discoverCard,
                  { backgroundColor: theme.surfaceInverse },
                ]}
                activeOpacity={0.82}
              >
                <Text style={styles.discoverEmoji}>{item.emoji}</Text>
                <Text
                  style={[styles.discoverPlace, { color: theme.textInverse }]}
                >
                  {item.place}
                </Text>
                <Text
                  style={[styles.discoverCountry, { color: theme.textInverse }]}
                >
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
  statValue: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
  statLabel: {
    fontSize: 10,
    opacity: 0.55,
    marginTop: 2,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  statDivider: { width: 1, height: 32, opacity: 0.15 },

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
  sectionLink: { fontSize: 13, opacity: 0.45, fontWeight: "500" },

  tripCard: {
    borderRadius: Radius.lg,
    marginBottom: 10,
    borderWidth: 1,
  },
  tripCardInner: { flexDirection: "row", alignItems: "center", padding: 18 },
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
  tripSubtitle: { fontSize: 13, opacity: 0.5 },
  tripArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  filtersRow: {
    paddingHorizontal: 28,
    gap: 10,
    paddingBottom: 12,
  },
  filterChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
  },
  filterChipText: { fontWeight: "600", fontSize: 13 },

  loadingContainer: { paddingVertical: 40, alignItems: "center" },

  featuredCard: {
    borderRadius: 30,
    padding: 26,
    minHeight: 240,
    justifyContent: "flex-end",
  },
  featuredTag: {
    opacity: 0.7,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.6,
    marginBottom: 18,
  },
  featuredTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -1,
  },
  featuredSubtitle: {
    opacity: 0.72,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  featuredType: {
    color: "#7DFF9B",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  emptyText: { opacity: 0.5 },

  discoverRow: { gap: Spacing.md, paddingRight: 28 },
  discoverCard: {
    width: 120,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: 14,
  },
  discoverEmoji: { fontSize: 28, marginBottom: Spacing.md },
  discoverPlace: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  discoverCountry: { fontSize: 11, opacity: 0.5 },

  bottomSpacer: { height: Spacing.xl },
});
