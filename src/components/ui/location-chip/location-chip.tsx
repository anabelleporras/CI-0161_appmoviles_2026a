import { ChevronDown } from "lucide-react-native";
import { useMemo } from "react";
import { Text, TouchableOpacity } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { createLocationChipStyles } from "./location-chip.styles";

export type LocationChipProps = {
  label: string;
  onPress?: () => void;
};

const LocationChip = ({ label, onPress }: LocationChipProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createLocationChipStyles(theme), [theme]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <ChevronDown size={16} color={theme.icon} strokeWidth={2} />
    </TouchableOpacity>
  );
};

export default LocationChip;
