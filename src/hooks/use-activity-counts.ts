import { useEffect, useRef, useState } from "react";

import type { Activity } from "@/constants/activities";
import { countNearby } from "@/services/google-places";

import type { Coords } from "./use-device-location";

export type ActivityCounts = Record<string, number>;

export type UseActivityCountsState = {
  counts: ActivityCounts;
  loading: boolean;
  error: string | null;
};

export type UseActivityCountsParams = {
  coords: Coords | null;
  activities: Activity[];
  maxPerActivity?: number;
  enabled?: boolean;
};

export const useActivityCounts = ({
  coords,
  activities,
  maxPerActivity = 20,
  enabled = true,
}: UseActivityCountsParams): UseActivityCountsState => {
  const [state, setState] = useState<UseActivityCountsState>({
    counts: {},
    loading: false,
    error: null,
  });

  const requestIdRef = useRef(0);
  const activitiesKey = activities.map((a) => a.id).join("|");

  useEffect(() => {
    if (!enabled || !coords || activities.length === 0) {
      setState({ counts: {}, loading: false, error: null });
      return;
    }

    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    Promise.allSettled(
      activities.map((activity) =>
        countNearby({
          lat: coords.latitude,
          lon: coords.longitude,
          includedTypes: activity.includedTypes,
          radius: activity.radius,
          maxResults: maxPerActivity,
        }),
      ),
    ).then((results) => {
      if (requestId !== requestIdRef.current) return;

      const counts: ActivityCounts = {};
      let firstError: string | null = null;

      results.forEach((result, index) => {
        const activity = activities[index];
        if (result.status === "fulfilled") {
          counts[activity.id] = result.value;
        } else {
          counts[activity.id] = 0;
          firstError ??= String(result.reason?.message ?? result.reason);
        }
      });

      setState({ counts, loading: false, error: firstError });
    });
  }, [coords?.latitude, coords?.longitude, activitiesKey, maxPerActivity, enabled]);

  return state;
};
