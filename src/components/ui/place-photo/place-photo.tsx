import { Image } from "expo-image";
import { Leaf, type LucideIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "@/hooks/use-theme";
import { photoUrl } from "@/services/google-places";

import { createPlacePhotoStyles } from "./place-photo.styles";

export type PlacePhotoProps = {
  photoName?: string;
  maxWidthPx?: number;
  style?: StyleProp<ViewStyle>;
  fallbackIcon?: LucideIcon;
  contentFit?: "cover" | "contain";
  transitionMs?: number;
};

const PlacePhoto = ({
  photoName,
  maxWidthPx = 800,
  style,
  fallbackIcon,
  contentFit = "cover",
  transitionMs = 200,
}: PlacePhotoProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createPlacePhotoStyles(theme), [theme]);
  const [errored, setErrored] = useState(false);

  const uri = useMemo(
    () => photoUrl(photoName, { maxWidthPx }),
    [photoName, maxWidthPx],
  );

  const showFallback = !uri || errored;
  const FallbackIcon = fallbackIcon ?? Leaf;

  return (
    <View style={[styles.wrapper, style]}>
      {showFallback ? (
        <View style={styles.fallback}>
          <FallbackIcon size={48} color={theme.textInverse} strokeWidth={1.5} />
        </View>
      ) : (
        <Image
          source={{ uri: uri! }}
          style={styles.image}
          contentFit={contentFit}
          transition={transitionMs}
          onError={() => setErrored(true)}
        />
      )}
    </View>
  );
};

export default PlacePhoto;
