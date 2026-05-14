import { useEffect, useRef, useState } from "react";

import { searchNearby, type GooglePlace } from "@/services/google-places";

import type { Coords } from "./use-device-location";

export type NearbyPlacesState = {
  places: GooglePlace[];
  loading: boolean;
  error: string | null;
};

export type UseNearbyPlacesParams = {
  coords: Coords | null;
  includedTypes: string[];
  radius?: number;
  maxResults?: number;
  enabled?: boolean;
};

export const useNearbyPlaces = ({
  coords,
  includedTypes,
  radius,
  maxResults,
  enabled = true,
}: UseNearbyPlacesParams): NearbyPlacesState => {
  const [state, setState] = useState<NearbyPlacesState>({
    places: [],
    loading: false,
    error: null,
  });

  const requestIdRef = useRef(0);
  const typesKey = [...includedTypes].sort().join("|");

  useEffect(() => {
    if (!enabled || !coords || includedTypes.length === 0) {
      setState({ places: [], loading: false, error: null });
      return;
    }

    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    searchNearby({
      lat: coords.latitude,
      lon: coords.longitude,
      includedTypes,
      radius,
      maxResults,
    })
      .then((places) => {
        if (requestId !== requestIdRef.current) return;
        setState({ places, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (requestId !== requestIdRef.current) return;
        setState({ places: [], loading: false, error: err.message });
      });
  }, [coords?.latitude, coords?.longitude, typesKey, radius, maxResults, enabled]);

  return state;
};
