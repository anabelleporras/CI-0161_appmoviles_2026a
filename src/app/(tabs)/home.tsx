import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
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
    </Svg>
  );
}

const filters = [
  {
    id: "beach",
    label: "Beaches",
    query: "natural=beach",
    radius: 100000,
  },
  {
    id: "park",
    label: "Parks",
    query: "leisure=park",
    radius: 10000,
  },
  {
    id: "lodging",
    label: "Lodges",
    query: "tourism=hotel",
    radius: 50000,
  },
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

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

    if (hour >= 5 && hour < 12) {
      greeting = "GOOD MORNING";
    } else if (hour >= 12 && hour < 18) {
      greeting = "GOOD AFTERNOON";
    }

    if (userName) {
      return `${greeting}, ${userName.toUpperCase()}`;
    }

    return greeting;
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

      const latitude = currentLocation.coords.latitude;

      const longitude = currentLocation.coords.longitude;

      setCoords({
        latitude,
        longitude,
      });

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
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "data=" + encodeURIComponent(query),
      });

      const text = await res.text();

      if (!text.startsWith("{")) {
        return;
      }

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

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setPlaces(formatted);
    } catch (error) {
      console.log("fetchNearbyPlaces error:", error);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoadingPlaces(false);
      }
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* HERO */}
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: heroFade,
              transform: [
                {
                  translateY: heroSlide,
                },
              ],
            },
          ]}
        >
          <View style={styles.leafTopRight}>
            <LeafDecor size={180} opacity={0.06} />
          </View>

          <View style={styles.leafBottomLeft}>
            <LeafDecor size={130} opacity={0.05} />
          </View>

          <View style={styles.locationCapsule}>
            <Text style={styles.locationText}>{locationLabel}</Text>
          </View>

          <Text style={styles.greeting}>{getGreeting()}</Text>

          <Text style={styles.heroHeadline}>
            What calls to you{"\n"}
            today?
          </Text>
        </Animated.View>

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
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => {
                  setPlaces([]);
                  setLoadingPlaces(true);
                  setSelectedFilter(filter);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FEATURED */}
        <View style={styles.section}>
          {loadingPlaces ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : featuredPlace ? (
            <TouchableOpacity activeOpacity={0.9} style={styles.featuredCard}>
              <Text style={styles.featuredTag}>EDITOR'S PICK · TODAY</Text>

              <Text style={styles.featuredTitle}>{featuredPlace.name}</Text>

              <Text style={styles.featuredSubtitle}>
                Discover nearby hidden gems and curated experiences around you.
              </Text>

              <Text style={styles.featuredType}>
                {featuredPlace.type} · {featuredPlace.distance} km away
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.emptyText}>No places found nearby.</Text>
          )}
        </View>

        {/* DISCOVER */}
        {!loadingPlaces && places.length > 1 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Discover Nearby</Text>
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
                  style={styles.discoverCard}
                >
                  <Text style={styles.discoverPlace}>{place.name}</Text>

                  <Text style={styles.discoverType}>
                    {place.type} · {place.distance} km
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F5F0",
  },

  hero: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    overflow: "hidden",
  },

  leafTopRight: {
    position: "absolute",
    top: -20,
    right: -30,
    transform: [
      {
        rotate: "30deg",
      },
    ],
  },

  leafBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: -20,
    transform: [
      {
        rotate: "-20deg",
      },
    ],
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
  },

  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A2B1E",
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
    fontSize: 42,
    fontWeight: "800",
    color: "#1A2B1E",
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 30,
  },

  filtersRow: {
    paddingHorizontal: 28,
    gap: 10,
    paddingBottom: 12,
  },

  filterChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E8E5DE",
  },

  filterChipActive: {
    backgroundColor: "#1A2B1E",
    borderColor: "#1A2B1E",
  },

  filterChipText: {
    color: "#1A2B1E",
    fontWeight: "600",
    fontSize: 13,
  },

  filterChipTextActive: {
    color: "#F7F5F0",
  },

  section: {
    paddingHorizontal: 28,
    marginTop: 10,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },

  featuredCard: {
    backgroundColor: "#1A2B1E",
    borderRadius: 30,
    padding: 26,
    minHeight: 240,
    justifyContent: "flex-end",
  },

  featuredTag: {
    color: "#F7F5F0",
    opacity: 0.7,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.6,
    marginBottom: 18,
  },

  featuredTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -1,
  },

  featuredSubtitle: {
    color: "#FFFFFF",
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

  emptyText: {
    color: "#1A2B1E",
    opacity: 0.5,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A2B1E",
  },

  discoverRow: {
    gap: 14,
    paddingRight: 28,
  },

  discoverCard: {
    width: 180,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E5DE",
  },

  discoverPlace: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A2B1E",
    marginBottom: 10,
  },

  discoverType: {
    fontSize: 13,
    color: "#1A2B1E",
    opacity: 0.55,
    textTransform: "capitalize",
  },
});
