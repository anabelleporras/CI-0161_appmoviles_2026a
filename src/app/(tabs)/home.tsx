import { Bell, Search } from "lucide-react-native";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActivityCard from "@/components/ui/activity-card";
import FeaturedCard from "@/components/ui/featured-card";
import IconButton from "@/components/ui/icon-button";
import LocationChip from "@/components/ui/location-chip";
import PlaceCard from "@/components/ui/place-card";
import SectionHeader from "@/components/ui/section-header";
import { ACTIVITIES, type Activity } from "@/constants/activities";
import { Spacing, Typography } from "@/constants/theme";
import { useActivityCounts } from "@/hooks/use-activity-counts";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { useNearbyPlaces } from "@/hooks/use-nearby-places";
import { useTheme } from "@/hooks/use-theme";
import { distanceKm } from "@/lib/distance";
import type { Place } from "@/services/places/types";
import { useFavoritesStore } from "@/store/favorites";
import type { FavoritePlace } from "@/store/favorites";
import { useSettingsStore } from '@/store/settings';

const FEATURED_TYPES = ["tourist_attraction"];
const FEATURED_COUNT = 5;
const COUNT_CAP = 20;

const rankFeatured = (places: Place[]): Place[] =>
  [...places]
    .sort((a, b) => {
      const aScore =
        (a.rating ?? 0) * Math.log10((a.ratingCount ?? 0) + 1);
      const bScore =
        (b.rating ?? 0) * Math.log10((b.ratingCount ?? 0) + 1);
      return bScore - aScore;
    })
    .slice(0, FEATURED_COUNT);

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
          removeFavorite(place.id);
        } else {
          addFavorite(toFavoritePlace(place));
        }
      }}
    />
  );
};

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const featuredCardWidth = windowWidth - Spacing.xl * 2 - Spacing["2xl"];
  const searchRadius = useSettingsStore((state) => state.searchRadius);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.background },
        scroll: { flex: 1 },
        scrollContent: { paddingBottom: 120 },
        headerRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: Spacing.xl,
          paddingTop: Spacing.md,
          paddingBottom: Spacing.lg,
        },
        headerActions: {
          flexDirection: "row",
          alignItems: "center",
          gap: Spacing.sm,
        },
        sectionSpacer: { marginTop: Spacing["2xl"] },
        activitiesRow: {
          paddingHorizontal: Spacing.xl,
          gap: Spacing.sm,
          paddingBottom: Spacing.md,
        },
        loadingContainer: {
          paddingVertical: Spacing["2xl"],
          alignItems: "center",
        },
        emptyState: {
          paddingVertical: Spacing["2xl"],
          alignItems: "center",
        },
        emptyText: {
          ...Typography.body2,
          color: theme.textMuted,
        },
        carouselRow: {
          paddingHorizontal: Spacing.xl,
          gap: Spacing.md,
        },
        bottomSpacer: { height: Spacing.xl },
      }),
    [theme],
  );

  const { coords, label } = useDeviceLocation();
  const [selectedActivity, setSelectedActivity] = useState<Activity>(
    ACTIVITIES[0],
  );

  const { counts, loading: countsLoading } = useActivityCounts({
    coords,
    activities: ACTIVITIES,
    maxPerActivity: COUNT_CAP,
    radius: searchRadius,
  });

  const { places, loading } = useNearbyPlaces({
    coords,
    includedTypes: selectedActivity.includedTypes,
    radius: searchRadius,
    maxResults: 20,
  });

  const featuredQuery = useNearbyPlaces({
    coords,
    includedTypes: FEATURED_TYPES,
    radius: 50000,
    maxResults: 20,
  });

  const featured = useMemo(
    () => rankFeatured(featuredQuery.places),
    [featuredQuery.places],
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

  const openPlace = (place: Place) =>
    router.push(`/place/${place.id}`);

  const openActivityList = (activityId: string) =>
    router.push(`/activity/${activityId}`);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <LocationChip label={label} />
          <View style={styles.headerActions}>
            <IconButton icon={Search} accessibilityLabel={t('home.searchAccessibility')} />
            <IconButton icon={Bell} badge accessibilityLabel={t('home.notificationsAccessibility')} />
          </View>
        </View>

        <SectionHeader
          title={t('home.topAttractions')}
          action={{ label: t('home.seeAll'), onPress: () => openActivityList("explore") }}
        />

        {featuredQuery.loading && featured.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        ) : featured.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {t('home.noFeaturedAttractions')}
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={featuredCardWidth + Spacing.md}
            snapToAlignment="start"
            contentContainerStyle={styles.carouselRow}
          >
            {featured.map((place) => (
              <FeaturedCard
                key={place.id}
                place={place}
                distanceKm={withDistance(place)}
                onViewDetails={() => openPlace(place)}
                onOpenInMap={() => openPlace(place)}
                style={{ width: featuredCardWidth }}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionSpacer} />

        <SectionHeader title={t('home.findYourPace')} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activitiesRow}
        >
          {ACTIVITIES.map((activity) => (
            <ActivityCard
              key={activity.id}
              icon={activity.icon}
              label={t(`activities.${activity.id}.label`)}
              count={counts[activity.id]}
              loading={countsLoading}
              maxCount={COUNT_CAP}
              selected={selectedActivity.id === activity.id}
              onPress={() => setSelectedActivity(activity)}
            />
          ))}
        </ScrollView>

        <SectionHeader
          title={t('home.nearby', { activity: t(`activities.${selectedActivity.id}.label`).toLowerCase() })}
          action={{
            label: t('home.seeAll'),
            onPress: () => openActivityList(selectedActivity.id),
          }}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        ) : places.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('home.noPlacesNearby')}</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselRow}
          >
            {places.map((place) => (
              <BookmarkablePlaceCard
                key={place.id}
                place={place}
                badge={t(`activities.${selectedActivity.id}.badge`)}
                distanceKm={withDistance(place)}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;