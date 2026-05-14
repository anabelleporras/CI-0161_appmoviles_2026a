import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { createSectionHeaderStyles } from "./section-header.styles";

export type SectionHeaderProps = {
  title: string;
  action?: { label: string; onPress: () => void };
};

const SectionHeader = ({ title, action }: SectionHeaderProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createSectionHeaderStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
          <Text style={styles.action}>
            {action.label} →
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SectionHeader;
