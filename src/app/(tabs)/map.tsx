import {
  Compass,
  Dog,
  Footprints,
  LayoutGrid,
  Sandwich,
  Tent,
  TreePine,
  Waves,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryPill from "@/components/ui/category-pill";
import MapMarkerPill from "@/components/ui/map-marker-pill";
import PlaceDetailSheet from "@/components/ui/place-detail-sheet";
import SearchBar from "@/components/ui/search-bar";
import { ACTIVITIES, ALL_ACTIVITY_TYPES } from "@/constants/activities";
import { Colors, Palette, Spacing } from "@/constants/theme";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { useNearbyPlaces } from "@/hooks/use-nearby-places";
import { useTheme } from "@/hooks/use-theme";
import { distanceKm } from "@/lib/distance";
import type { Place } from "@/services/places/types";
import { useSettingsStore } from '@/store/settings';
import { useFavoritesStore } from '@/store/favorites';
import type { FavoritePlace } from '@/store/favorites';

type MapFilter = {
  id: string;
  icon: LucideIcon;
  includedTypes: string[];
};

const FILTERS: MapFilter[] = [
  { id: "all", icon: LayoutGrid, includedTypes: ALL_ACTIVITY_TYPES },
  ...ACTIVITIES.map((a) => ({
    id: a.id,
    icon: a.icon,
    includedTypes: a.includedTypes,
  })),
];

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: Palette.forestNight.normal }] },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: Palette.ceibaGreen.text }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: Palette.forestNight.normal }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: Palette.forestNight.normalHover }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: Palette.forestNight.normalActive }],
  },
];

const iconForPlace = (place: Place): LucideIcon => {
  const types = place.types;
  if (types.includes("beach")) return Waves;
  if (types.includes("hiking_area")) return Footprints;
  if (types.includes("dog_park")) return Dog;
  if (
    types.includes("campground") ||
    types.includes("camping_cabin") ||
    types.includes("rv_park")
  )
    return Tent;
  if (types.includes("picnic_ground") || types.includes("barbecue_area"))
    return Sandwich;
  if (
    types.includes("park") ||
    types.includes("national_park") ||
    types.includes("state_park") ||
    types.includes("city_park") ||
    types.includes("garden")
  )
    return TreePine;
  return Compass;
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
  const { t } = useTranslation();
  const isDark = theme === Colors.dark;
  const searchRadius = useSettingsStore((state) => state.searchRadius);
  const filterLabel = (id: string) =>
    id === "all" ? t('map.filterAll') : t(`activities.${id}.label`);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.background },
        map: { ...StyleSheet.absoluteFill },
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
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [tracksMarkers, setTracksMarkers] = useState(true);

  const { addFavorite, removeFavorite } = useFavoritesStore();
  const favorites = useFavoritesStore((state) => state.favorites);

  const toFavoritePlace = (place: Place): FavoritePlace => ({
    placeId: place.id,
    name: place.name || undefined,
    address: place.address,
    lat: place.location?.latitude,
    lng: place.location?.longitude,
    types: place.types,
    rating: place.rating,
    photoName: place.photos[0]?.ref,
  });

  const activeFilter =
    FILTERS.find((f) => f.id === selectedFilterId) ?? FILTERS[0];

  const { places } = useNearbyPlaces({
    coords,
    includedTypes: activeFilter.includedTypes,
    radius: searchRadius,
    maxResults: 20,
  });

  const filteredPlaces = useMemo(() => {
    if (!searchTerm.trim()) return places;
    const needle = searchTerm.trim().toLowerCase();
    return places.filter((p) => p.name.toLowerCase().includes(needle));
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
        customMapStyle={isDark ? DARK_MAP_STYLE : []}
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
                label={place.name || t('common.place')}
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
          placeholder={t('map.searchPlaceholder')}
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
              label={filterLabel(filter.id)}
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
        onViewDetails={() => selectedPlace && router.push(`/place/${selectedPlace.id}`)}
        onBuyPass={() =>
          selectedPlace &&
          router.push({
            pathname: "/checkout",
            params: {
              placeId: selectedPlace.id,
              placeName: selectedPlace.name,
              types: (selectedPlace.types ?? []).join(","),
            },
          })
        }
        bookmarked={selectedPlace ? favorites.some((f) => f.placeId === selectedPlace.id) : false}
        onBookmark={() => {
          if (!selectedPlace) return;
          const current = useFavoritesStore.getState().favorites.some(
            (f) => f.placeId === selectedPlace.id
          );
          if (current) {
            removeFavorite(selectedPlace.id);
          } else {
            addFavorite(toFavoritePlace(selectedPlace));
          }
        }}
      />
    </View>
  );
};

export default MapScreen;