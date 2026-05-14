import { Bookmark, BookmarkCheck } from "lucide-react-native";
import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import PlacePhoto from "@/components/ui/place-photo";
import { useTheme } from "@/hooks/use-theme";
import type { GooglePlace } from "@/services/google-places";

import { createPlaceCardStyles } from "./place-card.styles";

export type PlaceCardProps = {
  place: GooglePlace;
  badgeLabel: string;
  distanceKm?: number;
  bookmarked?: boolean;
  onPress?: () => void;
  onBookmark?: () => void;
};

const PlaceCard = ({
  place,
  badgeLabel,
  distanceKm,
  bookmarked = false,
  onPress,
  onBookmark,
}: PlaceCardProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createPlaceCardStyles(theme), [theme]);

  const photoName = place.photos?.[0]?.name;
  const name = place.displayName?.text ?? "Unnamed place";
  const meta = [
    typeof place.rating === "number" ? `★ ${place.rating.toFixed(1)}` : null,
    typeof distanceKm === "number" ? `${distanceKm.toFixed(1)} km` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
    >
      <View>
        <PlacePhoto photoName={photoName} style={styles.photo} maxWidthPx={600} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel.toUpperCase()}</Text>
        </View>
        {onBookmark ? (
          <TouchableOpacity
            onPress={onBookmark}
            activeOpacity={0.8}
            style={styles.bookmark}
            accessibilityLabel="Bookmark place"
          >
            {bookmarked ? (
              <BookmarkCheck size={18} color={theme.accent} strokeWidth={2} />
            ) : (
              <Bookmark size={18} color={theme.icon} strokeWidth={2} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default PlaceCard;
