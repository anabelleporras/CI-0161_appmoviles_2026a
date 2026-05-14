import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import PlacePhoto from "@/components/ui/place-photo";
import { useTheme } from "@/hooks/use-theme";
import type { GooglePlace } from "@/services/google-places";

import { createFeaturedCardStyles } from "./featured-card.styles";

export type FeaturedCardProps = {
  place: GooglePlace;
  distanceKm?: number;
  onViewDetails?: () => void;
  onOpenInMap?: () => void;
};

const formatPrimaryType = (type?: string) => {
  if (!type) return "FEATURED";
  return `${type.replace(/_/g, " ").toUpperCase()} · FEATURED`;
};

const FeaturedCard = ({
  place,
  distanceKm,
  onViewDetails,
  onOpenInMap,
}: FeaturedCardProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createFeaturedCardStyles(theme), [theme]);

  const photoName = place.photos?.[0]?.name;
  const title = place.displayName?.text ?? "Featured place";
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
    <View style={styles.card}>
      <PlacePhoto
        photoName={photoName}
        style={styles.photo}
        maxWidthPx={1000}
      />
      <View style={styles.body}>
        <Text style={styles.tag}>{formatPrimaryType(place.primaryType)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onViewDetails}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>View details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenInMap}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Open in map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FeaturedCard;
