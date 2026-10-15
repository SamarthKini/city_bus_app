import { normalizeStopCoordinates } from "./stopCoordinates.js";

function isValidCoordinate(latitude, longitude) {
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90
    && longitude >= -180 && longitude <= 180;
}

/** Return the great-circle distance in metres, or null for invalid points. */
export function distanceInMeters(latitude1, longitude1, latitude2, longitude2) {
  if (!isValidCoordinate(latitude1, longitude1) || !isValidCoordinate(latitude2, longitude2)) return null;

  const radians = (degrees) => degrees * (Math.PI / 180);
  const latitudeDelta = radians(latitude2 - latitude1);
  const longitudeDelta = radians(longitude2 - longitude1);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(latitude1)) * Math.cos(radians(latitude2))
      * Math.sin(longitudeDelta / 2) ** 2;
  const boundedHaversine = Math.min(1, Math.max(0, haversine));
  const arc = 2 * Math.atan2(Math.sqrt(boundedHaversine), Math.sqrt(1 - boundedHaversine));
  return 6371000 * arc;
}

/** Resolve a selected destination only when it belongs to this route. */
export function resolveRouteDestination(stopObjects, destinationStopId) {
  if (destinationStopId === null || destinationStopId === undefined || destinationStopId === "") {
    return { status: "unselected", stop: null, coordinates: null, sequence: null };
  }
  if (!Array.isArray(stopObjects)) {
    return { status: "not-on-route", stop: null, coordinates: null, sequence: null };
  }

  const index = stopObjects.findIndex((stop) => stop
    && String(stop.id) === String(destinationStopId));
  if (index < 0) return { status: "not-on-route", stop: null, coordinates: null, sequence: null };

  const stop = stopObjects[index];
  const normalized = normalizeStopCoordinates(stop);
  if (!normalized.coordinates || !normalized.routable) {
    return {
      status: normalized.status === "unverified-stored" ? "unverified" : "invalid-coordinates",
      stop,
      coordinates: null,
      coordinateStatus: normalized.status,
      sequence: index + 1,
    };
  }
  return {
    status: "ready",
    stop,
    coordinates: normalized.coordinates,
    coordinateStatus: normalized.status,
    sequence: index + 1,
  };
}

export function shouldTriggerArrivalAlarm(distanceMeters, {
  monitoring,
  destinationIsUsable,
  locationIsValid,
  hasTriggered,
}, thresholdMeters = 500) {
  return monitoring === true
    && destinationIsUsable === true
    && locationIsValid === true
    && hasTriggered !== true
    && Number.isFinite(distanceMeters)
    && distanceMeters >= 0
    && Number.isFinite(thresholdMeters)
    && thresholdMeters >= 0
    && distanceMeters <= thresholdMeters;
}

/** Find the nearest usable stop without mutating the API stop objects. */
export function findNearestRouteStop(latitude, longitude, stopObjects) {
  if (!isValidCoordinate(latitude, longitude) || !Array.isArray(stopObjects)) return null;

  let nearest = null;
  stopObjects.forEach((stop, sequenceIndex) => {
    if (!stop) return;
    const normalized = normalizeStopCoordinates(stop);
    // Unverified raw coordinates (including audited IDs 303 and 304) and
    // points outside the plausibility bounds must not affect local tracking.
    if (!normalized.coordinates || !normalized.routable) return;
    const { latitude: stopLatitude, longitude: stopLongitude } = normalized.coordinates;
    const distance = distanceInMeters(latitude, longitude, stopLatitude, stopLongitude);
    if (distance === null || (nearest && distance >= nearest.distance_meters)) return;
    nearest = {
      id: stop.id,
      name: stop.name,
      latitude: stopLatitude,
      longitude: stopLongitude,
      distance_meters: distance,
      coordinate_source: normalized.status,
      sequence: sequenceIndex + 1,
    };
  });
  return nearest;
}
