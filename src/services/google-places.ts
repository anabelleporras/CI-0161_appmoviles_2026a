import { fetchWithTimeout } from "@/lib/distance";
import i18n from "@/lib/i18n";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_PLATFORM_API_KEY ?? "";
const BASE = "https://places.googleapis.com/v1";

const CACHE_TTL_MS = 10 * 60 * 1000;
const PLACES_API_MAX_RADIUS_M = 50000;

const CARD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
  "places.rating",
  "places.userRatingCount",
  "places.photos.name",
  "places.primaryType",
].join(",");

const DETAIL_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "types",
  "primaryType",
  "rating",
  "userRatingCount",
  "photos.name",
  "editorialSummary",
  "regularOpeningHours",
].join(",");

const IDS_MASK = "places.id";

export type GooglePlace = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  primaryType?: string;
  rating?: number;
  userRatingCount?: number;
  photos?: { name: string }[];
  editorialSummary?: { text?: string };
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
};

type CacheEntry = { data: GooglePlace[]; expiresAt: number };
const cache = new Map<string, CacheEntry>();

const cacheKey = (
  types: string[],
  lat: number,
  lon: number,
  radius: number,
  prefix = "",
) =>
  `${prefix}${i18n.language}_${[...types].sort().join("|")}_${lat.toFixed(2)}_${lon.toFixed(2)}_${radius}`;

const readCache = (key: string): GooglePlace[] | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const writeCache = (key: string, data: GooglePlace[]) => {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
};

export type SearchNearbyParams = {
  lat: number;
  lon: number;
  includedTypes: string[];
  maxResults?: number;
  radius?: number;
};

export const searchNearby = async ({
  lat,
  lon,
  includedTypes,
  maxResults = 20,
  radius = 15000,
}: SearchNearbyParams): Promise<GooglePlace[]> => {
  if (!API_KEY) throw new Error("Missing EXPO_PUBLIC_GOOGLE_MAPS_PLATFORM_API_KEY");

  const safeRadius = Math.min(radius, PLACES_API_MAX_RADIUS_M);
  const key = cacheKey(includedTypes, lat, lon, safeRadius);

  const cached = readCache(key);
  if (cached) return cached;

  const res = await fetchWithTimeout(
    `${BASE}/places:searchNearby`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": CARD_MASK,
      },
      body: JSON.stringify({
        includedTypes,
        maxResultCount: maxResults,
        languageCode: i18n.language,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lon },
            radius: safeRadius,
          },
        },
      }),
    },
    10000,
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Places searchNearby ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw: GooglePlace[] = data.places ?? [];
  const seen = new Set<string>();
  const places = raw.filter((p) => {
    if (!p.id || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  writeCache(key, places);
  return places;
};

export const countNearby = async ({
  lat,
  lon,
  includedTypes,
  maxResults = 20,
  radius = 15000,
}: SearchNearbyParams): Promise<number> => {
  if (!API_KEY) throw new Error("Missing EXPO_PUBLIC_GOOGLE_MAPS_PLATFORM_API_KEY");
  if (includedTypes.length === 0) return 0;

  const safeRadius = Math.min(radius, PLACES_API_MAX_RADIUS_M);
  const key = cacheKey(includedTypes, lat, lon, safeRadius, "count:");

  const cached = readCache(key);
  if (cached) return cached.length;

  const res = await fetchWithTimeout(
    `${BASE}/places:searchNearby`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": IDS_MASK,
      },
      body: JSON.stringify({
        includedTypes,
        maxResultCount: maxResults,
        languageCode: i18n.language,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lon },
            radius: safeRadius,
          },
        },
      }),
    },
    10000,
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Places countNearby ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const places: GooglePlace[] = data.places ?? [];
  writeCache(key, places);
  return places.length;
};

export const placeDetails = async (placeId: string): Promise<GooglePlace> => {
  if (!API_KEY) throw new Error("Missing EXPO_PUBLIC_GOOGLE_MAPS_PLATFORM_API_KEY");

  const res = await fetchWithTimeout(
    `${BASE}/places/${encodeURIComponent(placeId)}?languageCode=${i18n.language}`,
    {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": DETAIL_MASK,
      },
    },
    10000,
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Places details ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
};

export const photoUrl = (
  photoName: string | undefined,
  options: { maxWidthPx?: number } = {},
): string | null => {
  if (!photoName || !API_KEY) return null;
  const width = options.maxWidthPx ?? 800;
  return `${BASE}/${photoName}/media?maxWidthPx=${width}&key=${API_KEY}`;
};

export const clearPlacesCache = () => cache.clear();
