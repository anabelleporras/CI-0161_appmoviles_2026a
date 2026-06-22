import { Image } from "expo-image";
import { Leaf, type LucideIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { places } from "@/services/providers";
import type { PhotoRef } from "@/services/places/types";
import { createPlacePhotoStyles } from "./place-photo.styles";

export type PlacePhotoProps = {
  photo?: PhotoRef;
  maxWidthPx?: number;
  style?: StyleProp<ViewStyle>;
  fallbackIcon?: LucideIcon;
  contentFit?: "cover" | "contain";
  transitionMs?: number;
};

const PlacePhoto = ({
  photo,
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
    () => (photo ? places.photoUrl(photo, maxWidthPx) : null),
    [photo, maxWidthPx],
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
