export function getStopName(stopId, stops) {
  const stop = stops.find((item) => String(item.id) === String(stopId) || String(item.stop_id) === String(stopId));
  return stop?.name || `Stop ${stopId}`;
}

function getStopObject(stopId, stops) {
  return stops.find((item) => String(item.id) === String(stopId) || String(item.stop_id) === String(stopId));
}

function routeStops(route, stops) {
  const stopIds = route?.stopIds || route?.stops || [];
  return { stopIds, stops: stopIds.map((stopId) => getStopName(stopId, stops)), stopObjects: stopIds.map((stopId) => getStopObject(stopId, stops)).filter(Boolean) };
}

function metric(route, names) {
  return names.map((name) => route?.[name]).find((value) => value !== undefined && value !== null);
}

export function buildDirectRoute(route, stops) {
  const journey = routeStops(route, stops);
  const busNumber = route.bus_number ?? route.busNumber ?? route.routeNumber;
  return {
    ...route, ...journey, id: route.id, busNumber, routeNumber: busNumber,
    routeName: route.route_name ?? route.name ?? `Bus ${busNumber ?? "—"}`,
    source: journey.stops[0] ?? "—", destination: journey.stops.at(-1) ?? "—",
    isConnection: false, segments: [{ busNumber }],
    travelTimeMin: metric(route, ["travel_time_min", "travelTimeMin"]),
    distanceKm: metric(route, ["distance_km", "distanceKm"]), fare: metric(route, ["fare"]),
  };
}

export function buildConnectionRoute(connection, stops) {
  const firstRoute = connection.from_route ?? connection.first_route ?? connection.routes?.[0];
  const secondRoute = connection.to_route ?? connection.second_route ?? connection.routes?.[1];
  const firstJourney = routeStops(firstRoute, stops);
  const secondJourney = routeStops(secondRoute, stops);
  const repeatedTransfer = firstJourney.stopIds.length > 0 && String(firstJourney.stopIds.at(-1)) === String(secondJourney.stopIds[0]);
  const skipSecondStart = repeatedTransfer ? 1 : 0;
  const stopIds = [...firstJourney.stopIds, ...secondJourney.stopIds.slice(skipSecondStart)];
  const stopNames = [...firstJourney.stops, ...secondJourney.stops.slice(skipSecondStart)];
  const stopObjects = [...firstJourney.stopObjects, ...secondJourney.stopObjects.slice(skipSecondStart)];
  const transfer = connection.transfer_stop;
  const transferStop = transfer?.name ?? (transfer ? getStopName(transfer.id ?? transfer, stops) : undefined);
  const firstBus = firstRoute?.bus_number ?? firstRoute?.busNumber;
  const secondBus = secondRoute?.bus_number ?? secondRoute?.busNumber;
  return {
    ...connection, id: connection.id ?? `${firstRoute?.id ?? firstBus}-${secondRoute?.id ?? secondBus}-${transfer?.id ?? transfer ?? "connection"}`,
    busNumber: [firstBus, secondBus].filter(Boolean).join(" + ") || "—", routeNumber: [firstBus, secondBus].filter(Boolean).join(" + ") || "—",
    routeName: connection.route_name ?? connection.name ?? `Bus ${firstBus ?? "—"} to Bus ${secondBus ?? "—"}`,
    source: stopNames[0] ?? "—", destination: stopNames.at(-1) ?? "—", stopIds, stops: stopNames, stopObjects,
    isConnection: true, segments: [{ busNumber: firstBus }, { busNumber: secondBus }].filter((segment) => segment.busNumber), transferStop,
    travelTimeMin: metric(connection, ["travel_time_min", "travelTimeMin"]), distanceKm: metric(connection, ["distance_km", "distanceKm"]), fare: metric(connection, ["fare"]), totalStops: metric(connection, ["total_stops", "totalStops"]),
  };
}
