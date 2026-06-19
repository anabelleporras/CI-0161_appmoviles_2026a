import { useEffect, useMemo, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { Bookmark, BookmarkCheck } from 'lucide-react-native';

import PlacePhoto from "@/components/ui/place-photo";
import { useTheme } from "@/hooks/use-theme";
//import type { GooglePlace } from "@/services/google-places";
import type { Place } from "@/services/places/types";

import { formatDistance } from '@/lib/distance';
import { useSettingsStore } from '@/store/settings';

import { createPlaceDetailSheetStyles } from "./place-detail-sheet.styles";

export type PlaceDetailSheetProps = {
  place: Place | null;
  distanceKm?: number;
  onViewDetails?: () => void;
  bookmarked?: boolean;
  onBookmark?: () => void;
};

const formatTag = (place: Place) => {
  const type = place.primaryType?.replace(/_/g, " ").toUpperCase() ?? "PLACE";
  const featured = (place.rating ?? 0) > 4.5 ? " · FEATURED" : "";
  return `${type}${featured}`;
};

const PlaceDetailSheet = ({
  place,
  distanceKm,
  onViewDetails,
  bookmarked = false,
  onBookmark,
}: PlaceDetailSheetProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createPlaceDetailSheetStyles(theme), [theme]);

  const translateY = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const units = useSettingsStore((state) => state.units);

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

  const photo = place.photos[0];
  const meta = [
    typeof place.rating === "number" ? `★ ${place.rating.toFixed(1)}` : null,
    typeof distanceKm === "number" ? formatDistance(distanceKm, units) : null,
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
        photo={photo}
        style={styles.thumbnail}
        maxWidthPx={300}
      />
      <View style={styles.body}>
        <Text style={styles.tag}>{formatTag(place)}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {place.name || "Place"}
        </Text>
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
        <View style={styles.actions}>
          {onBookmark && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onBookmark}
              activeOpacity={0.85}
            >
              {bookmarked ? (
                <BookmarkCheck size={18} color={theme.accent} strokeWidth={2} />
              ) : (
                <Bookmark size={18} color={theme.icon} strokeWidth={2} />
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onViewDetails}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText} numberOfLines={1}>
              View details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default PlaceDetailSheet;
