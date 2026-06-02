import {
  Compass,
  Dog,
  Footprints,
  Sandwich,
  Tent,
  TreePine,
  Waves,
  type LucideIcon,
} from "lucide-react-native";

/**
 * Single source of truth for the activity taxonomy used by Home and Map.
 *
 * Every value in `includedTypes` is validated against Google Places API (New)
 * **Table A** — the only set of types accepted by Nearby Search `includedTypes`.
 * (Several were added in the Feb 2026 Places release: `state_park`,
 * `city_park`, `scenic_spot`.) Do not add a type here without checking it is in
 * Table A, or the Nearby Search request will fail.
 *
 */
export type Activity = {
  id: string;
  label: string;
  badge: string;
  icon: LucideIcon;
  includedTypes: string[];
  radius: number;
};

export const ACTIVITIES: Activity[] = [
  {
    id: "trails",
    label: "Trails",
    badge: "Trail",
    icon: Footprints,
    includedTypes: ["hiking_area"],
    radius: 40000,
  },
  {
    id: "beaches",
    label: "Beaches",
    badge: "Beach",
    icon: Waves,
    includedTypes: ["beach"],
    radius: 50000,
  },
  {
    id: "parks",
    label: "Parks",
    badge: "Park",
    icon: TreePine,
    includedTypes: [
      "park",
      "national_park",
      "state_park",
      "city_park",
      "garden",
    ],
    radius: 30000,
  },
  {
    id: "dog_parks",
    label: "Dog parks",
    badge: "Dog park",
    icon: Dog,
    includedTypes: ["dog_park"],
    radius: 20000,
  },
  {
    id: "camping",
    label: "Camping",
    badge: "Camp",
    icon: Tent,
    includedTypes: ["campground", "camping_cabin", "rv_park"],
    radius: 50000,
  },
  {
    id: "picnic",
    label: "Picnic",
    badge: "Picnic",
    icon: Sandwich,
    includedTypes: ["picnic_ground", "barbecue_area"],
    radius: 25000,
  },
  {
    id: "explore",
    label: "Explore",
    badge: "Spot",
    icon: Compass,
    includedTypes: ["tourist_attraction", "visitor_center", "scenic_spot"],
    radius: 30000,
  },
];

export const ALL_ACTIVITY_TYPES = Array.from(
  new Set(ACTIVITIES.flatMap((a) => a.includedTypes)),
);

export const getActivity = (id: string | undefined): Activity | undefined =>
  ACTIVITIES.find((a) => a.id === id);
