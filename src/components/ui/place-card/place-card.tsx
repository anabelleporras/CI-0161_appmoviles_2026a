import { Bookmark, BookmarkCheck } from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import PlacePhoto from "@/components/ui/place-photo";
import { useTheme } from "@/hooks/use-theme";
import { formatDistance } from "@/lib/distance";
import type { Place } from "@/services/places/types";
import { useSettingsStore } from "@/store/settings";
import { createPlaceCardStyles } from "./place-card.styles";

export type PlaceCardProps = {
  place: Place;
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
  const { t } = useTranslation();
  const styles = useMemo(() => createPlaceCardStyles(theme), [theme]);
  const units = useSettingsStore((state) => state.units);

  const photo = place.photos[0];
  const name = place.name || t('common.unnamedPlace');
  const meta = [
    typeof place.rating === "number" ? `★ ${place.rating.toFixed(1)}` : null,
    typeof distanceKm === "number" ? formatDistance(distanceKm, units) : null,
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
        <PlacePhoto photo={photo} style={styles.photo} maxWidthPx={600} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel.toUpperCase()}</Text>
        </View>
        {onBookmark ? (
          <TouchableOpacity
            onPress={onBookmark}
            activeOpacity={0.8}
            style={styles.bookmark}
            accessibilityLabel={t('placeCard.bookmarkAccessibility')}
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