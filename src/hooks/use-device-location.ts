import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Coords } from "@/services/places/types";

export type LocationAddress = {
  city?: string | null;
  region?: string | null;
  country?: string | null;
};

export type LocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "error";

export type DeviceLocation = {
  coords: Coords | null;
  address: LocationAddress | null;
  status: LocationStatus;
  label: string;
  refresh: () => Promise<void>;
};

export const useDeviceLocation = (): DeviceLocation => {
  const { t } = useTranslation();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [address, setAddress] = useState<LocationAddress | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");

  const formatLabel = (loc: LocationAddress | null): string => {
    if (!loc) return t('deviceLocation.unknownLocation');
    const primary = loc.city ?? loc.region ?? loc.country ?? t('deviceLocation.unknown');
    const secondary = loc.country && loc.city ? loc.country : null;
    return secondary ? `${primary}, ${secondary}` : primary;
  };

  const refresh = useCallback(async () => {
    setStatus("loading");

    const { status: permission } =
      await Location.requestForegroundPermissionsAsync();

    if (permission !== "granted") {
      setStatus("denied");
      return;
    }

    let position: Location.LocationObject | null = null;
    try {
      position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    } catch {
      position = await Location.getLastKnownPositionAsync();
    }

    if (!position) {
      setStatus("error");
      return;
    }

    const next: Coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    setCoords(next);
    setStatus("granted");

    try {
      const [place] = await Location.reverseGeocodeAsync(next);
      if (place) {
        setAddress({
          city: place.city,
          region: place.region,
          country: place.country,
        });
      }
    } catch {
      // Reverse geocode failures are non-fatal — keep coords, drop the label.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    coords,
    address,
    status,
    label:
      status === "loading"
        ? t('deviceLocation.loading')
        : status === "denied"
          ? t('deviceLocation.locationOff')
          : status === "error"
            ? t('deviceLocation.unknownLocation')
            : formatLabel(address),
    refresh,
  };
};
