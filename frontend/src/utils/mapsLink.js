export function buildGoogleMapsRouteUrl(stopObjects) {
  if (!stopObjects || stopObjects.length < 2) return null;

  const validStops = stopObjects.filter(
    (stop) => stop && Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude)
  );

  if (validStops.length < 2) return null;

  const origin = validStops[0];
  const destination = validStops[validStops.length - 1];
  const waypointStops = validStops.slice(1, -1);

  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: "transit",
  });

  if (waypointStops.length > 0) {
    const waypoints = waypointStops
      .map((stop) => `${stop.latitude},${stop.longitude}`)
      .join("|");

    params.set("waypoints", waypoints);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
