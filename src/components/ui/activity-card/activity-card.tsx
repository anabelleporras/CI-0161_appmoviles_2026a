import { type LucideIcon } from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { createActivityCardStyles } from "./activity-card.styles";

export type ActivityCardProps = {
  icon: LucideIcon;
  label: string;
  count?: number;
  loading?: boolean;
  maxCount?: number;
  selected?: boolean;
  onPress?: () => void;
};

const ActivityCard = ({
  icon: Icon,
  label,
  count,
  loading = false,
  maxCount = 20,
  selected = false,
  onPress,
}: ActivityCardProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createActivityCardStyles(theme, selected),
    [theme, selected],
  );

  const iconColor = selected ? theme.textOnAccent : theme.textInverse;

  const countLabel =
    count === undefined
      ? "—"
      : count >= maxCount
        ? t('activityCard.nearbyCountMax', { count: maxCount })
        : t('activityCard.nearbyCount', { count });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Icon size={22} strokeWidth={2} color={iconColor} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Text style={styles.count}>{countLabel}</Text>
      )}
    </TouchableOpacity>
  );
};

export default ActivityCard;
