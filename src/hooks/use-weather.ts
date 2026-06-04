import { useEffect, useState } from "react";

import { fetchWithTimeout } from "@/lib/distance";

export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm"
  | "unknown";

export type Weather = {
  temperatureC: number;
  condition: WeatherCondition;
  windSpeedKmh: number;
};

/** Maps WMO weather code → our condition label */
const toCondition = (code: number): WeatherCondition => {
  if (code === 0) return "clear";
  if (code <= 3) return "partly-cloudy";
  if (code <= 48) return "fog";
  if (code <= 55) return "drizzle";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "rain";
  if (code <= 99) return "thunderstorm";
  return "unknown";
};

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 min

type CacheEntry = { data: Weather; expiresAt: number };
const cache = new Map<string, CacheEntry>();

const fetchWeather = async (lat: number, lon: number): Promise<Weather> => {
  const key = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&timezone=auto`;

  const res = await fetchWithTimeout(url, {}, 8000);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);

  const json = await res.json();
  const current = json.current as {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };

  const data: Weather = {
    temperatureC: Math.round(current.temperature_2m),
    condition: toCondition(current.weather_code),
    windSpeedKmh: Math.round(current.wind_speed_10m),
  };

  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; weather: Weather }
  | { status: "error"; message: string };

export const useWeather = (
  lat: number | undefined,
  lon: number | undefined,
): State => {
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (lat === undefined || lon === undefined) return;
    let active = true;
    setState({ status: "loading" });
    fetchWeather(lat, lon)
      .then((weather) => active && setState({ status: "ok", weather }))
      .catch((err: Error) =>
        active && setState({ status: "error", message: err.message }),
      );
    return () => {
      active = false;
    };
  }, [lat, lon]);

  return state;
};
