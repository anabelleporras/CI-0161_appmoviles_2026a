import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, List, Map as MapIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MapMarkerPill from "@/components/ui/map-marker-pill";
import PlaceCard from "@/components/ui/place-card";
import { getActivity } from "@/constants/activities";
import { Spacing, Typography } from "@/constants/theme";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { useNearbyPlaces } from "@/hooks/use-nearby-places";
import { useTheme } from "@/hooks/use-theme";
import { distanceKm } from "@/lib/distance";
import type { Place } from "@/services/places/types";
import { useFavoritesStore } from "@/store/favorites";
import type { FavoritePlace } from "@/store/favorites";

const COSTA_RICA_FALLBACK = {
  latitude: 9.7489,
  longitude: -83.7534,
  latitudeDelta: 4,
  longitudeDelta: 4,
};

type ViewMode = "list" | "map";

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

type BookmarkablePlaceCardProps = {
  place: Place;
  badge: string;
  distanceKm?: number;
};

const BookmarkablePlaceCard = ({
  place,
  badge,
  distanceKm: distance,
}: BookmarkablePlaceCardProps) => {
  const favorites = useFavoritesStore((state) => state.favorites);
  const { addFavorite, removeFavorite } = useFavoritesStore();
  const bookmarked = favorites.some((f) => f.placeId === place.id);

  return (
    <PlaceCard
      place={place}
      badgeLabel={badge}
      distanceKm={distance}
      bookmarked={bookmarked}
      onPress={() => router.push(`/place/${place.id}`)}
      onBookmark={() => {
        if (bookmarked) {
          removeFavorite(place.id!);
        } else {
          addFavorite(toFavoritePlace(place));
        }
      }}
    />
  );
};

const ActivityListScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const activity = getActivity(id);

  const { coords } = useDeviceLocation();
  const [mode, setMode] = useState<ViewMode>("list");

  const { places, loading } = useNearbyPlaces({
    coords,
    includedTypes: activity?.includedTypes ?? [],
    radius: activity?.radius,
    maxResults: 20,
    enabled: !!activity,
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.background },
        header: {
          flexDirection: "row",
          alignItems: "center",
          gap: Spacing.md,
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.md,
        },
        title: { fontSize: 20, fontWeight: "700", color: theme.text, flex: 1 },
        iconBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.textMuted,
        },
        listContent: {
          paddingHorizontal: Spacing.xl,
          gap: Spacing.md,
          paddingBottom: 120,
        },
        center: { flex: 1, alignItems: "center", justifyContent: "center" },
        muted: { ...Typography.body2, color: theme.textMuted },
        map: { flex: 1 },
      }),
    [theme],
  );

  const withDistance = (place: Place) => {
    if (!coords || !place.location) return undefined;
    return distanceKm(
      coords.latitude,
      coords.longitude,
      place.location.latitude,
      place.location.longitude,
    );
  };

  const initialRegion = coords
    ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.3,
        longitudeDelta: 0.3,
      }
    : COSTA_RICA_FALLBACK;

  if (!activity) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.muted}>{t('activityDetail.unknownActivity')}</Text>
      </View>
    );
  }

  const activityLabel = t(`activities.${activity.id}.label`);
  const activityBadge = t(`activities.${activity.id}.badge`);

  const ActivityIcon = activity.icon;

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.back()}
          accessibilityLabel={t('common.back')}
        >
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
        <Text style={styles.title}>{activityLabel}</Text>
        <Pressable
          style={styles.iconBtn}
          onPress={() => setMode((m) => (m === "list" ? "map" : "list"))}
          accessibilityLabel={mode === "list" ? t('activityDetail.showMap') : t('activityDetail.showList')}
        >
          {mode === "list" ? (
            <MapIcon size={20} color={theme.text} />
          ) : (
            <List size={20} color={theme.text} />
          )}
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      ) : places.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>
            {t('activityDetail.noResultsNearby', { activity: activityLabel.toLowerCase() })}
          </Text>
        </View>
      ) : mode === "list" ? (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {places.map((place) => (
            <BookmarkablePlaceCard
              key={place.id}
              place={place}
              badge={activityBadge}
              distanceKm={withDistance(place)}
            />
          ))}
        </ScrollView>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          showsPointsOfInterests={false}
        >
          {places.map((place) => {
            if (!place.location) return null;
            return (
              <Marker
                key={place.id}
                coordinate={{
                  latitude: place.location.latitude,
                  longitude: place.location.longitude,
                }}
                onPress={() => router.push(`/place/${place.id}`)}
                anchor={{ x: 0.5, y: 1 }}
              >
                <MapMarkerPill
                  icon={ActivityIcon}
                  label={place.name || t('common.place')}
                  selected={false}
                />
              </Marker>
            );
          })}
        </MapView>
      )}
    </View>
  );
};

export default ActivityListScreen;