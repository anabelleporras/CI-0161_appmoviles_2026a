import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Heart, MapPin, Navigation, Star } from "lucide-react-native";
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
import { useDeviceLocation } from "@/hooks/use-device-location";
import { useTheme } from "@/hooks/use-theme";
import { distanceKm } from "@/lib/distance";
import { placeDetails, photoUrl, type GooglePlace } from "@/services/google-places";

const openInExternalMap = (place: GooglePlace) => {
  if (!place.location) return;
  const { latitude, longitude } = place.location;
  Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  ).catch(() => {});
};

const PlaceDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { coords } = useDeviceLocation();

  const [place, setPlace] = useState<GooglePlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) return;
    setLoading(true);
    placeDetails(id)
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
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background,
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
          borderColor: theme.text,
        },
      }),
    [theme],
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

  const heroUrl = photoUrl(place.photos?.[0]?.name, { maxWidthPx: 1000 });
  const distance =
    coords && place.location
      ? distanceKm(
          coords.latitude,
          coords.longitude,
          place.location.latitude,
          place.location.longitude,
        )
      : undefined;
  const hours = place.regularOpeningHours?.weekdayDescriptions ?? [];

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
          <Pressable
            style={[styles.backBtn, { top: insets.top + Spacing.sm }]}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{place.displayName?.text ?? "Place"}</Text>

          <View style={styles.metaRow}>
            {place.rating !== undefined && (
              <View style={styles.metaItem}>
                <Star size={14} color={theme.text} fill={theme.text} />
                <Text style={styles.metaText}>
                  {place.rating.toFixed(1)}
                  {place.userRatingCount
                    ? ` (${place.userRatingCount})`
                    : ""}
                </Text>
              </View>
            )}
            {distance !== undefined && (
              <View style={styles.metaItem}>
                <MapPin size={14} color={theme.textMuted} />
                <Text style={styles.metaText}>{distance.toFixed(1)} km away</Text>
              </View>
            )}
          </View>

          {place.formattedAddress && (
            <Text style={styles.metaText}>{place.formattedAddress}</Text>
          )}

          {place.editorialSummary?.text && (
            <Text style={styles.summary}>{place.editorialSummary.text}</Text>
          )}

          {/* TODO(phase-2): weather (Open-Meteo) + affluence cards go here,
              keyed off place.location. */}

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
                // TODO(phase-3): toggle favourite
              }}
              accessibilityLabel="Save to favourites"
            >
              <Heart size={20} color={theme.text} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PlaceDetailScreen;
