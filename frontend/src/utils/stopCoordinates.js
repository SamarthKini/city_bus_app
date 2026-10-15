// Broad plausibility box used by the completed coordinate audit. This is not
// proof that a point is accurate; it is only used to decide whether a WKT
// point likely has its axes reversed for the Mangaluru area.
export const MANGALURU_BOUNDS = Object.freeze({
  minLongitude: 74.6,
  maxLongitude: 75.1,
  minLatitude: 12.6,
  maxLatitude: 13.2,
});

const USE_STORED_COORDINATES_ONLY = new Set(["303", "304"]);

function isWithinMangaluru({ longitude, latitude }) {
  return longitude >= MANGALURU_BOUNDS.minLongitude
    && longitude <= MANGALURU_BOUNDS.maxLongitude
    && latitude >= MANGALURU_BOUNDS.minLatitude
    && latitude <= MANGALURU_BOUNDS.maxLatitude;
}

function validPoint(longitude, latitude) {
  return Number.isFinite(longitude)
    && Number.isFinite(latitude)
    && longitude >= -180 && longitude <= 180
    && latitude >= -90 && latitude <= 90;
}

function parseWktLocation(location) {
  if (typeof location !== "string") return null;
  const match = location.trim().match(/^(?:SRID=4326;)?\s*POINT\s*\(\s*(-?(?:\d+\.?\d*|\.\d+))\s+(-?(?:\d+\.?\d*|\.\d+))\s*\)$/i);
  if (!match) return null;
  return { longitude: Number(match[1]), latitude: Number(match[2]) };
}

/**
 * Normalize a Django stop for map display without modifying the API object.
 * Standard GeoDjango WKT is x/y = longitude/latitude. Only swap when that
 * interpretation is outside the audit box and the reversed interpretation
 * is inside it. The box is a plausibility check, not a coordinate source.
 */
export function normalizeStopCoordinates(stop) {
  if (!stop) return { coordinates: null, storedCoordinates: null, status: "missing", routable: false };

  const point = parseWktLocation(stop.location);
  if (!point) {
    return { coordinates: null, storedCoordinates: null, status: stop.location ? "invalid" : "missing", routable: false };
  }

  if (!validPoint(point.longitude, point.latitude)) {
    return { coordinates: null, storedCoordinates: point, status: "invalid", routable: false };
  }

  if (USE_STORED_COORDINATES_ONLY.has(String(stop.id))) {
    // These two audited records are plotted as their stored WKT x/y values
    // (longitude/latitude), without the normal plausibility-based axis swap.
    return { coordinates: point, storedCoordinates: point, status: "unverified-stored", routable: false };
  }

  if (validPoint(point.longitude, point.latitude) && isWithinMangaluru(point)) {
    return { coordinates: point, storedCoordinates: point, status: "original", routable: true };
  }

  const swapped = { longitude: point.latitude, latitude: point.longitude };
  if (validPoint(swapped.longitude, swapped.latitude) && isWithinMangaluru(swapped)) {
    return { coordinates: swapped, storedCoordinates: point, status: "swapped-plausibility", routable: true };
  }

  const originalIsValid = validPoint(point.longitude, point.latitude);
  return { coordinates: null, storedCoordinates: point, status: originalIsValid ? "outside-plausibility" : "invalid", routable: false };
}
