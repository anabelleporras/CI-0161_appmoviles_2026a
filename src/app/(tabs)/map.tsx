import {
  Compass,
  Hotel,
  LayoutGrid,
  TreePine,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryPill from "@/components/ui/category-pill";
import MapMarkerPill from "@/components/ui/map-marker-pill";
import PlaceDetailSheet from "@/components/ui/place-detail-sheet";
import SearchBar from "@/components/ui/search-bar";
import { Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { useNearbyPlaces } from "@/hooks/use-nearby-places";
import { useTheme } from "@/hooks/use-theme";
import { distanceKm } from "@/lib/distance";
import type { GooglePlace } from "@/services/google-places";

type MapFilter = {
  id: string;
  label: string;
  icon: LucideIcon;
  includedTypes: string[];
};

const ALL_TYPES = [
  "beach",
  "park",
  "national_park",
  "lodging",
  "hotel",
  "resort_hotel",
  "restaurant",
  "cafe",
  "tourist_attraction",
  "museum",
];

const FILTERS: MapFilter[] = [
  { id: "all", label: "All", icon: LayoutGrid, includedTypes: ALL_TYPES },
  { id: "beaches", label: "Beaches", icon: Waves, includedTypes: ["beach"] },
  {
    id: "hotels",
    label: "Hotels",
    icon: Hotel,
    includedTypes: ["lodging", "hotel", "resort_hotel"],
  },
  {
    id: "restaurants",
    label: "Restaurants",
    icon: UtensilsCrossed,
    includedTypes: ["restaurant", "cafe"],
  },
  {
    id: "parks",
    label: "Parks",
    icon: TreePine,
    includedTypes: ["park", "national_park"],
  },
  {
    id: "attractions",
    label: "Attractions",
    icon: Compass,
    includedTypes: ["tourist_attraction", "museum"],
  },
];

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1A2B1E" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#C8EDD1" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1A2B1E" }] },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#223726" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#132017" }],
  },
];

const iconForPlace = (place: GooglePlace): LucideIcon => {
  const types = place.types ?? [];
  if (types.includes("beach")) return Waves;
  if (types.includes("park") || types.includes("national_park")) return TreePine;
  if (
    types.includes("lodging") ||
    types.includes("hotel") ||
    types.includes("resort_hotel")
  )
    return Hotel;
  if (types.includes("restaurant") || types.includes("cafe"))
    return UtensilsCrossed;
  return Compass;
};

const openInExternalMap = async (place: GooglePlace) => {
  if (!place.location) return;
  const { latitude, longitude } = place.location;
  const candidates = [
    `comgooglemaps://?q=${latitude},${longitude}&zoom=14`,
    `google.navigation:q=${latitude},${longitude}`,
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  ];

  for (const url of candidates) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // try next
    }
  }
};

const COSTA_RICA_FALLBACK = {
  latitude: 9.7489,
  longitude: -83.7534,
  latitudeDelta: 4,
  longitudeDelta: 4,
};

const MapScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const scheme = useColorScheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.background },
        map: { ...StyleSheet.absoluteFill},
        overlay: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.sm,
        },
        chipsRow: {
          gap: Spacing.sm,
          paddingVertical: Spacing.xs,
          paddingRight: Spacing.lg,
        },
      }),
    [theme],
  );

  const { coords } = useDeviceLocation();
  const [selectedFilterId, setSelectedFilterId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null);
  const [tracksMarkers, setTracksMarkers] = useState(true);

  const activeFilter =
    FILTERS.find((f) => f.id === selectedFilterId) ?? FILTERS[0];

  const { places } = useNearbyPlaces({
    coords,
    includedTypes: activeFilter.includedTypes,
    radius: 15000,
    maxResults: 20,
  });

  const filteredPlaces = useMemo(() => {
    if (!searchTerm.trim()) return places;
    const needle = searchTerm.trim().toLowerCase();
    return places.filter((p) =>
      (p.displayName?.text ?? "").toLowerCase().includes(needle),
    );
  }, [places, searchTerm]);

  useEffect(() => {
    if (!places.length) return;
    setTracksMarkers(true);
    const timer = setTimeout(() => setTracksMarkers(false), 600);
    return () => clearTimeout(timer);
  }, [places]);

  const initialRegion = coords
    ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }
    : COSTA_RICA_FALLBACK;

  const selectedDistance =
    coords && selectedPlace?.location
      ? distanceKm(
          coords.latitude,
          coords.longitude,
          selectedPlace.location.latitude,
          selectedPlace.location.longitude,
        )
      : undefined;

  return (
    <View style={styles.root}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsPointsOfInterests={false}
        customMapStyle={scheme === "dark" ? DARK_MAP_STYLE : []}
        onPress={() => setSelectedPlace(null)}
      >
        {filteredPlaces.map((place) => {
          if (!place.location) return null;
          const isSelected = selectedPlace?.id === place.id;
          return (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.location.latitude,
                longitude: place.location.longitude,
              }}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedPlace(place);
              }}
              tracksViewChanges={tracksMarkers || isSelected}
              anchor={{ x: 0.5, y: 1 }}
            >
              <MapMarkerPill
                icon={iconForPlace(place)}
                label={place.displayName?.text ?? "Place"}
                selected={isSelected}
              />
            </Marker>
          );
        })}
      </MapView>

      <View style={[styles.overlay, { top: insets.top + 8 }]}>
        <SearchBar
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="La Fortuna and around"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTERS.map((filter) => (
            <CategoryPill
              key={filter.id}
              icon={filter.icon}
              label={filter.label}
              variant="compact"
              selected={activeFilter.id === filter.id}
              onPress={() => {
                setSelectedFilterId(filter.id);
                setSelectedPlace(null);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <PlaceDetailSheet
        place={selectedPlace}
        distanceKm={selectedDistance}
        onViewDetails={() => {}}
        onOpenInMap={() => selectedPlace && openInExternalMap(selectedPlace)}
      />
    </View>
  );
};

export default MapScreen;
