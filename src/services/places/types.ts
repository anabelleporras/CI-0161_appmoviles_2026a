export type Coords = { latitude: number; longitude: number };
export type PhotoRef = { ref: string };

export type Place = {
  id: string;
  name: string;
  address?: string;
  location?: Coords;
  types: string[];
  primaryType?: string;
  rating?: number;
  ratingCount?: number;
  photos: PhotoRef[];
  summary?: string;
  openingHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
};

export type NearbyParams = {
  coords: Coords;
  includedTypes: string[];
  radius?: number;
  maxResults?: number;
};

export interface PlacesProvider {
  nearby(p: NearbyParams): Promise<Place[]>;
  countNearby(p: NearbyParams): Promise<number>;
  details(id: string): Promise<Place>;
  photoUrl(ref: PhotoRef, maxWidth: number): string | null;
}