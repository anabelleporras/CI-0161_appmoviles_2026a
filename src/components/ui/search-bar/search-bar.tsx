import { Search } from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TextInput, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

import { createSearchBarStyles } from "./search-bar.styles";

export type SearchBarProps = {
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
};

const SearchBar = ({
  value,
  onChangeText,
  placeholder,
}: SearchBarProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createSearchBarStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Search size={18} color={theme.iconMuted} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('common.search')}
        placeholderTextColor={theme.textMuted}
        style={styles.input}
        returnKeyType="search"
      />
    </View>
  );
};

export default SearchBar;
