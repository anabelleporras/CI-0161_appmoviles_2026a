import { type LucideIcon } from "lucide-react-native";
import { memo, useMemo } from "react";
import { Text, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { createMapMarkerPillStyles } from "./map-marker-pill.styles";

export type MapMarkerPillProps = {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  iconColor?: string;
};

const MapMarkerPillImpl = ({
  icon: Icon,
  label,
  selected = false,
  iconColor,
}: MapMarkerPillProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createMapMarkerPillStyles(theme), [theme]);

  return (
    <View style={[styles.pill, selected && styles.pillSelected]}>
      <View style={styles.iconWrap}>
        <Icon
          size={12}
          color={iconColor ?? theme.textOnAccent}
          strokeWidth={2.5}
        />
      </View>
      <Text
        style={[styles.label, selected && styles.labelSelected]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const MapMarkerPill = memo(MapMarkerPillImpl);

export default MapMarkerPill;
