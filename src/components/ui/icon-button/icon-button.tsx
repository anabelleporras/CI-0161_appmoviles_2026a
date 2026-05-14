import { type LucideIcon } from "lucide-react-native";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { createIconButtonStyles } from "./icon-button.styles";

export type IconButtonProps = {
  icon: LucideIcon;
  onPress?: () => void;
  badge?: boolean;
  variant?: "circle" | "ghost";
  accessibilityLabel?: string;
};

const IconButton = ({
  icon: Icon,
  onPress,
  badge = false,
  variant = "circle",
  accessibilityLabel,
}: IconButtonProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createIconButtonStyles(theme), [theme]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.base, variant === "ghost" && styles.ghost]}
    >
      <Icon size={20} color={theme.icon} strokeWidth={2} />
      {badge ? <View style={styles.badge} /> : null}
    </TouchableOpacity>
  );
};

export default IconButton;
