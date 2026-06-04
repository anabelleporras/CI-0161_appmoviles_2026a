import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Palette, Radius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  rating?: number;
  userRatingCount?: number;
};

// Same scoring formula used in rankFeatured (home.tsx): rating × log10(reviews + 1).
// log10 dampens huge review counts, so a place with 5 star 100 reviews doesn't
// lose to a 4 star 100 000 reviews place.
const MAX_SCORE = 25; // practical ceiling: 5★ × log10(100 001) ≈ 25

const computeScore = (rating = 0, count = 0): number => {
  const raw = rating * Math.log10(count + 1);
  // Clamp to 0–100 so the progress bar never overflows
  return Math.min(Math.round((raw / MAX_SCORE) * 100), 100);
};

type Tier = { label: string; color: string };

// Splits the 0–100 score into three visual buckets:
const getTier = (score: number): Tier => {
  if (score >= 67) return { label: "Very popular", color: Palette.guanacasteAmber.normal };
  if (score >= 34) return { label: "Moderately popular", color: Palette.guanacasteAmber.normalHover };
  return { label: "Not recommended", color: Palette.ceibaGreen.normal };
};

export const PopularityCard = ({ rating, userRatingCount }: Props) => {
  const theme = useTheme();

  const score = computeScore(rating, userRatingCount);
  const tier = getTier(score);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        sectionLabel: {
          ...Typography.body3,
          color: theme.textMuted,
          marginBottom: Spacing.sm,
        },
        card: {
          backgroundColor: theme.surface,
          borderRadius: Radius.lg,
          padding: Spacing.lg,
          gap: Spacing.md,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        tierRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: Spacing.sm,
        },
        // Colored dot acts as a visual help for the tier
        dot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: tier.color,
        },
        tierLabel: {
          ...Typography.caption,
          fontWeight: "600",
          color: theme.text,
        },
        scoreText: {
          ...Typography.body3,
          color: theme.textMuted,
        },
        track: {
          height: 6,
          borderRadius: Radius.pill,
          backgroundColor: theme.border,
          overflow: "hidden",
        },
        fill: {
          height: "100%",
          borderRadius: Radius.pill,
          backgroundColor: tier.color,
          width: `${score}%`,
        },
        footnote: {
          ...Typography.body3,
          color: theme.textMuted,
        },
      }),
    [theme, tier, score],
  );

  // Nothing to show if Google didn't return any rating data for this place
  if (!rating && !userRatingCount) return null;

  return (
    <View>
      <Text style={styles.sectionLabel}>Estimated popularity</Text>
      <View style={styles.card}>
        {/* Tier label on the left, numeric score on the right */}
        <View style={styles.header}>
          <View style={styles.tierRow}>
            <View style={styles.dot} />
            <Text style={styles.tierLabel}>{tier.label}</Text>
          </View>
          <Text style={styles.scoreText}>{score}/100</Text>
        </View>

        {/* Progress bar — width is driven by the computed score */}
        <View style={styles.track}>
          <View style={styles.fill} />
        </View>

        <Text style={styles.footnote}>
          Based on {userRatingCount?.toLocaleString() ?? "0"} reviews · {rating?.toFixed(1) ?? "—"} stars
        </Text>
      </View>
    </View>
  );
};
