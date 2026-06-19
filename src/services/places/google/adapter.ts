import {
  searchNearby, countNearby, placeDetails, photoUrl,
  type GooglePlace,
} from "../../google-places";
import type { Place, PhotoRef, PlacesProvider } from "../types";

const toPlace = (g: GooglePlace): Place => ({
  id: g.id,
  name: g.displayName?.text ?? "",
  address: g.formattedAddress,
  location: g.location,
  types: g.types ?? [],
  primaryType: g.primaryType,
  rating: g.rating,
  ratingCount: g.userRatingCount,
  photos: (g.photos ?? []).map((p): PhotoRef => ({ ref: p.name })),
  summary: g.editorialSummary?.text,
  openingHours: g.regularOpeningHours && {
    openNow: g.regularOpeningHours.openNow,
    weekdayDescriptions: g.regularOpeningHours.weekdayDescriptions,
  },
});

export const googlePlaces: PlacesProvider = {
  nearby: async ({ coords, includedTypes, radius, maxResults }) =>
    (await searchNearby({
      lat: coords.latitude, lon: coords.longitude, includedTypes, radius, maxResults,
    })).map(toPlace),
  countNearby: ({ coords, includedTypes, radius, maxResults }) =>
    countNearby({
      lat: coords.latitude, lon: coords.longitude, includedTypes, radius, maxResults,
    }),
  details: async (id) => toPlace(await placeDetails(id)),
  photoUrl: (photo, maxWidth) => photoUrl(photo.ref, { maxWidthPx: maxWidth }),
};