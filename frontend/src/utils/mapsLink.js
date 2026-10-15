import { normalizeStopCoordinates } from "./stopCoordinates.js";

export function buildGoogleMapsRouteUrl(stopObjects) {
  if (!stopObjects || stopObjects.length < 2) return null;

  const coordinates = stopObjects.map((stop) => normalizeStopCoordinates(stop).coordinates);
  // Every route stop must be usable; never quietly create directions that
  // omit a stop or bridge across a missing/unverified coordinate.
  if (coordinates.some((point) => !point)) return null;
  const origin = coordinates[0];
  const destination = coordinates.at(-1);

  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: "transit",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
