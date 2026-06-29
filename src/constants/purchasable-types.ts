/**
 * Google Place `types` for which the app offers a (mock) admission ticket / pass.
 *
 * This gates the "Get pass" button on the client ONLY — it is not a price source.
 * The backend catalog is the single source of truth for what is purchasable and at
 * what price; this list simply mirrors the catalog's `appliesToTypes` so we don't
 * push the user into a checkout that would come back with an empty product list.
 * Keep it in sync with the server catalog.
 */
export const PURCHASABLE_TYPES: ReadonlySet<string> = new Set([
  "national_park",
  "state_park",
  "city_park",
  "park",
  "tourist_attraction",
  "visitor_center",
  "campground",
  "rv_park",
]);

/** True when any of the place's Google types maps to a purchasable product. */
export const isPurchasable = (place: { types?: string[] }): boolean =>
  place.types?.some((type) => PURCHASABLE_TYPES.has(type)) ?? false;
