import {
  Bell,
  Compass,
  Hotel,
  Search,
  TreePine,
  UtensilsCrossed,
  Waves,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryPill from "@/components/ui/category-pill";
import FeaturedCard from "@/components/ui/featured-card";
import IconButton from "@/components/ui/icon-button";
import LocationChip from "@/components/ui/location-chip";
import PlaceCard from "@/components/ui/place-card";
import SectionHeader from "@/components/ui/section-header";
import { Spacing, Typography } from "@/constants/theme";
import { useDeviceLocation } from "@/hooks/use-device-location";
import { useNearbyPlaces } from "@/hooks/use-nearby-places";
import { useTheme } from "@/hooks/use-theme";
import { distanceKm } from "@/lib/distance";
import type { GooglePlace } from "@/services/google-places";

type Filter = {
  id: string;
  label: string;
  badge: string;
  icon: typeof Waves;
  includedTypes: string[];
  radius: number;
};

const FILTERS: Filter[] = [
  {
    id: "beach",
    label: "Beaches",
    badge: "Beach",
    icon: Waves,
    includedTypes: ["beach"],
    radius: 50000,
  },
  {
    id: "park",
    label: "Parks",
    badge: "Park",
    icon: TreePine,
    includedTypes: ["park", "national_park"],
    radius: 30000,
  },
  {
    id: "lodging",
    label: "Lodges",
    badge: "Lodge",
    icon: Hotel,
    includedTypes: ["lodging", "resort_hotel", "bed_and_breakfast", "cottage"],
    radius: 30000,
  },
  {
    id: "restaurant",
    label: "Food",
    badge: "Food",
    icon: UtensilsCrossed,
    includedTypes: ["restaurant", "cafe"],
    radius: 10000,
  },
  {
    id: "explore",
    label: "Explore",
    badge: "Spot",
    icon: Compass,
    includedTypes: ["tourist_attraction", "museum"],
    radius: 30000,
  },
];

const FEATURED_TYPES = ["tourist_attraction"];
const FEATURED_COUNT = 5;

const rankFeatured = (places: GooglePlace[]): GooglePlace[] =>
  [...places]
    .sort((a, b) => {
      const aScore =
        (a.rating ?? 0) * Math.log10((a.userRatingCount ?? 0) + 1);
      const bScore =
        (b.rating ?? 0) * Math.log10((b.userRatingCount ?? 0) + 1);
      return bScore - aScore;
    })
    .slice(0, FEATURED_COUNT);

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const featuredCardWidth = windowWidth - Spacing.xl * 2 - Spacing["2xl"];
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
        filtersRow: {
          paddingHorizontal: Spacing.xl,
          gap: Spacing.sm,
          paddingBottom: Spacing.md,
        },
        section: {
          paddingHorizontal: Spacing.xl,
          marginTop: Spacing.md,
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
  const [selectedFilter, setSelectedFilter] = useState<Filter>(FILTERS[0]);

  const { places, loading } = useNearbyPlaces({
    coords,
    includedTypes: selectedFilter.includedTypes,
    radius: selectedFilter.radius,
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

  const withDistance = (place: GooglePlace) => {
    if (!coords || !place.location) return undefined;
    return distanceKm(
      coords.latitude,
      coords.longitude,
      place.location.latitude,
      place.location.longitude,
    );
  };

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
            <IconButton icon={Search} accessibilityLabel="Search" />
            <IconButton icon={Bell} badge accessibilityLabel="Notifications" />
          </View>
        </View>

        <SectionHeader
          title="Top attractions"
          action={{ label: "See all", onPress: () => {} }}
        />

        {featuredQuery.loading && featured.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        ) : featured.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No featured attractions nearby.
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
                onViewDetails={() => {}}
                onOpenInMap={() => {}}
                style={{ width: featuredCardWidth }}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionSpacer} />

        <SectionHeader
          title="Find your pace"
          action={{ label: "See all", onPress: () => {} }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((filter) => (
            <CategoryPill
              key={filter.id}
              icon={filter.icon}
              label={filter.label}
              selected={selectedFilter.id === filter.id}
              onPress={() => setSelectedFilter(filter)}
            />
          ))}
        </ScrollView>

        <SectionHeader
          title={`Nearby ${selectedFilter.label.toLowerCase()}`}
          action={{ label: "See all", onPress: () => {} }}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        ) : places.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No places found nearby.</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselRow}
          >
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                badgeLabel={selectedFilter.badge}
                distanceKm={withDistance(place)}
                onPress={() => {}}
                onBookmark={() => {}}
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
