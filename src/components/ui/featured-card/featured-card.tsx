import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import PlacePhoto from "@/components/ui/place-photo";
import { useTheme } from "@/hooks/use-theme";
import { formatDistance } from "@/lib/distance";
import { useSettingsStore } from "@/store/settings";
import type { Place } from "@/services/places/types";

import { createFeaturedCardStyles } from "./featured-card.styles";

export type FeaturedCardProps = {
  place: Place;
  distanceKm?: number;
  onViewDetails?: () => void;
  onOpenInMap?: () => void;
  style?: StyleProp<ViewStyle>;
};

const FeaturedCard = ({
  place,
  distanceKm,
  onViewDetails,
  onOpenInMap,
  style,
}: FeaturedCardProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createFeaturedCardStyles(theme), [theme]);
  const units = useSettingsStore((state) => state.units);

  const formatPrimaryType = (type?: string) => {
    const featured = t('common.featured');
    if (!type) return featured;
    return `${type.replace(/_/g, " ").toUpperCase()} · ${featured}`;
  };

  const photo = place.photos[0];
  const title = place.name || t('featuredCard.featuredPlaceFallback');
  const meta = [
    typeof place.rating === "number" ? `★ ${place.rating.toFixed(1)}` : null,
    typeof distanceKm === "number" ? formatDistance(distanceKm, units) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={[styles.card, style]}>
      <PlacePhoto
        photo={photo}
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
            <Text style={styles.secondaryButtonText}>{t('common.viewDetails')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenInMap}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>{t('featuredCard.openInMap')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FeaturedCard;
