import { Search } from "lucide-react-native";
import { useMemo } from "react";
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
  placeholder = "Search",
}: SearchBarProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createSearchBarStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Search size={18} color={theme.iconMuted} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={styles.input}
        returnKeyType="search"
      />
    </View>
  );
};

export default SearchBar;
