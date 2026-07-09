import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  SunDim,
  Thermometer,
  Wind,
} from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Radius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useWeather, type WeatherCondition } from "@/hooks/use-weather";

type Props = { lat: number; lon: number };

// Maps each WMO condition to its translation key
const CONDITION_KEY: Record<WeatherCondition, string> = {
  clear: "conditionClear",
  "partly-cloudy": "conditionPartlyCloudy",
  overcast: "conditionOvercast",
  fog: "conditionFog",
  drizzle: "conditionDrizzle",
  rain: "conditionRain",
  snow: "conditionSnow",
  thunderstorm: "conditionThunderstorm",
  unknown: "conditionUnknown",
};

// Picks the right lucide icon for each condition
const ConditionIcon = ({
  condition,
  color,
  size = 28,
}: {
  condition: WeatherCondition;
  color: string;
  size?: number;
}) => {
  const props = { size, color };
  switch (condition) {
    case "clear":
      return <Sun {...props} />;
    case "partly-cloudy":
      return <SunDim {...props} />;
    case "overcast":
      return <Cloud {...props} />;
    case "fog":
      return <CloudFog {...props} />;
    case "drizzle":
      return <CloudDrizzle {...props} />;
    case "rain":
      return <CloudRain {...props} />;
    case "snow":
      return <CloudSnow {...props} />;
    case "thunderstorm":
      return <CloudLightning {...props} />;
    default:
      return <Cloud {...props} />;
  }
};

// Calls useWeather with the place's coordinates and renders a card.
export const WeatherCard = ({ lat, lon }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  // useWeather handles fetching + 15-min cache internally
  const weather = useWeather(lat, lon);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.surface,
          borderRadius: Radius.lg,
          padding: Spacing.lg,
          flexDirection: "row",
          alignItems: "center",
          gap: Spacing.lg,
        },
        iconCol: {
          alignItems: "center",
          justifyContent: "center",
          width: 44,
        },
        mainCol: { flex: 1, gap: 2 },
        temp: { fontSize: 28, fontWeight: "700", color: theme.text },
        condition: { ...Typography.caption, color: theme.textMuted },
        rightCol: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        },
        wind: { ...Typography.caption, color: theme.textMuted },
        sectionLabel: {
          ...Typography.body3,
          color: theme.textMuted,
          marginBottom: Spacing.sm,
        },
        loading: { padding: Spacing.lg, alignItems: "center" },
      }),
    [theme],
  );

  // Still fetching. Shows a small spinner
  if (weather.status === "loading" || weather.status === "idle") {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={theme.textMuted} />
      </View>
    );
  }

  // If the API call failed hide the card
  if (weather.status === "error") return null;

  const { temperatureC, condition, windSpeedKmh } = weather.weather;

  return (
    <View>
      <Text style={styles.sectionLabel}>{t('weatherCard.currentWeather')}</Text>
      {/* Icon | temp + condition label | wind speed */}
      <View style={styles.card}>
        <View style={styles.iconCol}>
          <ConditionIcon condition={condition} color={theme.text} />
        </View>
        <View style={styles.mainCol}>
          <Text style={styles.temp}>{temperatureC}°C</Text>
          <Text style={styles.condition}>{t(`weatherCard.${CONDITION_KEY[condition]}`)}</Text>
        </View>
        <View style={styles.rightCol}>
          <Wind size={14} color={theme.textMuted} />
          <Text style={styles.wind}>{windSpeedKmh} km/h</Text>
        </View>
      </View>
    </View>
  );
};
