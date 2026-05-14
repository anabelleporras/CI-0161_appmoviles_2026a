import { useEffect, useMemo, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

import PlacePhoto from "@/components/ui/place-photo";
import { useTheme } from "@/hooks/use-theme";
import type { GooglePlace } from "@/services/google-places";

import { createPlaceDetailSheetStyles } from "./place-detail-sheet.styles";

export type PlaceDetailSheetProps = {
  place: GooglePlace | null;
  distanceKm?: number;
  onViewDetails?: () => void;
  onOpenInMap?: () => void;
};

const formatTag = (place: GooglePlace) => {
  const type = place.primaryType?.replace(/_/g, " ").toUpperCase() ?? "PLACE";
  const featured = (place.rating ?? 0) > 4.5 ? " · FEATURED" : "";
  return `${type}${featured}`;
};

const PlaceDetailSheet = ({
  place,
  distanceKm,
  onViewDetails,
  onOpenInMap,
}: PlaceDetailSheetProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createPlaceDetailSheetStyles(theme), [theme]);

  const translateY = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: place ? 0 : 200,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: place ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [place, translateY, opacity]);

  if (!place) return null;

  const meta = [
    typeof place.rating === "number" ? `★ ${place.rating.toFixed(1)}` : null,
    typeof place.userRatingCount === "number"
      ? `${place.userRatingCount.toLocaleString()} reviews`
      : null,
    typeof distanceKm === "number" ? `${distanceKm.toFixed(1)} km` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Animated.View
      style={[
        styles.sheet,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <PlacePhoto
        photoName={place.photos?.[0]?.name}
        style={styles.thumbnail}
        maxWidthPx={300}
      />
      <View style={styles.body}>
        <Text style={styles.tag}>{formatTag(place)}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {place.displayName?.text ?? "Place"}
        </Text>
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onViewDetails}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>View details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onOpenInMap}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Open in map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default PlaceDetailSheet;
