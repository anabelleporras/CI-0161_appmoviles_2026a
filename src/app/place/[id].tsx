import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Bookmark, BookmarkCheck, MapPin, Navigation, Star, Ticket } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing, Typography } from "@/constants/theme";
import { isPurchasable } from "@/constants/purchasable-types";
import IconButton from "@/components/ui/icon-button";
import { PhotoStrip } from "@/components/ui/photo-strip";
import { PopularityCard } from "@/components/ui/popularity-card";
import { WeatherCard } from "@/components/ui/weather-card";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { useTheme } from "@/hooks/use-theme";
import { distanceKm } from "@/lib/distance";
import { places } from "@/services/providers";
import type { Place } from "@/services/places/types";
import { useFavoritesStore } from "@/store/favorites";
import type { FavoritePlace } from "@/store/favorites";
import { formatDistance } from '@/lib/distance';
import { useSettingsStore } from '@/store/settings';

const openInExternalMap = (place: Place) => {
  if (!place.location) return;
  const { latitude, longitude } = place.location;
  Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  ).catch(() => {});
};

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

const PlaceDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { coords } = useDeviceLocation();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const favorites = useFavoritesStore((state) => state.favorites);
  const { addFavorite, removeFavorite } = useFavoritesStore();
  const bookmarked = favorites.some((f) => f.placeId === id);
  const units = useSettingsStore((state) => state.units);

  useEffect(() => {
    let active = true;
    if (!id) return;
    setLoading(true);
    places
      .details(id)
      .then((data) => active && setPlace(data))
      .catch((err: Error) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.background },
        center: { flex: 1, alignItems: "center", justifyContent: "center" },
        muted: { ...Typography.body2, color: theme.textMuted },
        hero: { width: "100%", height: 260, backgroundColor: theme.textMuted },
        backBtn: {
          position: "absolute",
          left: Spacing.xl,
        },
        body: { padding: Spacing.xl, gap: Spacing.md },
        title: { fontSize: 24, fontWeight: "700", color: theme.text },
        metaRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
        metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
        metaText: { ...Typography.body2, color: theme.textMuted },
        summary: { ...Typography.body2, color: theme.text, lineHeight: 22 },
        hoursTitle: { fontSize: 16, fontWeight: "600", color: theme.text, marginTop: Spacing.sm },
        hourLine: { ...Typography.body2, color: theme.textMuted },
        actions: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.md },
        primaryBtn: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: Spacing.sm,
          paddingVertical: 14,
          borderRadius: 99,
          backgroundColor: theme.text,
        },
        primaryText: { fontSize: 15, fontWeight: "600", color: theme.background },
        favBtn: {
          width: 52,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 99,
          borderWidth: 1.5,
          borderColor: bookmarked ? theme.accent : theme.text,
        },
      }),
    [theme, bookmarked],
  );

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  if (error || !place) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.muted}>{error ?? "Place not found."}</Text>
      </View>
    );
  }

  const heroPhoto = place.photos[selectedPhotoIndex];
  const heroUrl = heroPhoto ? places.photoUrl(heroPhoto, 1000) : null;
  const distance =
    coords && place.location
      ? distanceKm(
          coords.latitude,
          coords.longitude,
          place.location.latitude,
          place.location.longitude,
        )
      : undefined;
  const hours = place.openingHours?.weekdayDescriptions ?? [];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {heroUrl ? (
            <Image source={{ uri: heroUrl }} style={styles.hero} />
          ) : (
            <View style={styles.hero} />
          )}
          <View style={[styles.backBtn, { top: insets.top + Spacing.sm }]}>
            <IconButton
              icon={ArrowLeft}
              onPress={() => router.back()}
              accessibilityLabel="Back"
            />
          </View>
        </View>

        {place.photos.length > 1 && (
          <PhotoStrip
            photos={place.photos}
            selectedIndex={selectedPhotoIndex}
            onSelect={setSelectedPhotoIndex}
          />
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{place.name || "Place"}</Text>
          <View style={styles.metaRow}>
            {place.rating !== undefined && (
              <View style={styles.metaItem}>
                <Star size={14} color={theme.text} fill={theme.text} />
                <Text style={styles.metaText}>
                  {place.rating.toFixed(1)}
                  {place.ratingCount ? ` (${place.ratingCount})` : ""}
                </Text>
              </View>
            )}
            {distance !== undefined && (
              <View style={styles.metaItem}>
                <MapPin size={14} color={theme.textMuted} />
                <Text style={styles.metaText}>{formatDistance(distance, units)} away</Text>
              </View>
            )}
          </View>

          {place.address && (
            <Text style={styles.metaText}>{place.address}</Text>
          )}

          {place.summary && (
            <Text style={styles.summary}>{place.summary}</Text>
          )}

          {place.location && (
            <WeatherCard
              lat={place.location.latitude}
              lon={place.location.longitude}
            />
          )}

          <PopularityCard
            rating={place.rating}
            userRatingCount={place.ratingCount}
          />
          {hours.length > 0 && (
            <>
              <Text style={styles.hoursTitle}>Opening hours</Text>
              {hours.map((line) => (
                <Text key={line} style={styles.hourLine}>
                  {line}
                </Text>
              ))}
            </>
          )}

          <View style={styles.actions}>
            {isPurchasable(place) && (
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
                onPress={() =>
                  router.push({
                    pathname: "/checkout",
                    params: {
                      placeId: place.id,
                      placeName: place.name,
                      types: (place.types ?? []).join(","),
                    },
                  })
                }
                accessibilityLabel="Get pass for this place"
              >
                <Ticket size={18} color={theme.textOnAccent} />
                <Text style={[styles.primaryText, { color: theme.textOnAccent }]}>
                  Get pass
                </Text>
              </Pressable>
            )}
            <Pressable
              style={styles.primaryBtn}
              onPress={() => openInExternalMap(place)}
            >
              <Navigation size={18} color={theme.background} />
              <Text style={styles.primaryText}>Open in Maps</Text>
            </Pressable>
            <Pressable
              style={styles.favBtn}
              onPress={() => {
                const current = useFavoritesStore.getState().favorites.some(
                  (f) => f.placeId === id
                );
                if (current) {
                  removeFavorite(id!);
                } else if (place) {
                  addFavorite(toFavoritePlace(place));
                }
              }}
              accessibilityLabel="Save to favourites"
            >
              {bookmarked ? (
                <BookmarkCheck size={20} color={theme.accent} strokeWidth={2} />
              ) : (
                <Bookmark size={20} color={theme.text} strokeWidth={2} />
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PlaceDetailScreen;
