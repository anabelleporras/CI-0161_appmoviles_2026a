import { type LucideIcon } from "lucide-react-native";
import { useMemo } from "react";
import { Text, TouchableOpacity } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { createCategoryPillStyles } from "./category-pill.styles";

export type CategoryPillProps = {
  icon?: LucideIcon;
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: "chip" | "compact";
  accentColor?: string;
};

const CategoryPill = ({
  icon: Icon,
  label,
  selected = false,
  onPress,
  variant = "chip",
  accentColor,
}: CategoryPillProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createCategoryPillStyles(theme), [theme]);

  const iconSize = variant === "compact" ? 14 : 16;
  const iconColor =
    accentColor ?? (selected ? theme.textInverse : theme.icon);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected }}
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.base,
        variant === "compact" && styles.compact,
        selected && styles.baseSelected,
      ]}
    >
      {Icon ? <Icon size={iconSize} color={iconColor} strokeWidth={2} /> : null}
      <Text
        style={[
          styles.label,
          variant === "compact" && styles.labelCompact,
          selected && styles.labelSelected,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryPill;
