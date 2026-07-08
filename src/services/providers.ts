import { googlePlaces } from "./places/google/adapter";
import type { PlacesProvider } from "./places/types";

export const places: PlacesProvider = googlePlaces;
