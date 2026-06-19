import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { places } from "@/services/providers";
import type { PhotoRef } from "@/services/places/types";

type Props = {
  photos: PhotoRef[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

const THUMB_WIDTH = 120;
const THUMB_HEIGHT = 88;

export const PhotoStrip = ({ photos, selectedIndex, onSelect }: Props) => {
  if (photos.length < 2) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {photos.map((photo, index) => {
        const uri = places.photoUrl(photo, 400);
        if (!uri) return null;
        const isSelected = index === selectedIndex;
        return (
          <Pressable key={photo.ref} onPress={() => onSelect(index)}>
            <View style={styles.thumb}>
              <Image
                source={{ uri }}
                style={[styles.image, !isSelected && styles.dimmed]}
              />
              {isSelected && <View style={styles.selectedRing} />}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  thumb: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  dimmed: {
    opacity: 0.5,
  },
  selectedRing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
