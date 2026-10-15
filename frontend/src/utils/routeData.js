export function getStopName(stopId, stops) {
  const stop = stops.find((item) => String(item.id) === String(stopId) || String(item.stop_id) === String(stopId));
  return stop?.name || `Stop ${stopId}`;
}

function getStopObject(stopId, stops) {
  return stops.find((item) => String(item.id) === String(stopId) || String(item.stop_id) === String(stopId));
}

function routeStops(route, stops, routeStopRecords) {
  const sequenceRecords = (routeStopRecords || [])
    .filter((record) => String(record.route) === String(route?.id))
    .sort((a, b) => Number(a.sequence) - Number(b.sequence));
  const stopIds = sequenceRecords.length
    ? sequenceRecords.map((record) => record.stop)
    : route?.stopIds || route?.stops || [];
  return {
    stopIds,
    stops: stopIds.map((stopId) => getStopName(stopId, stops)),
    stopObjects: stopIds.map((stopId) => getStopObject(stopId, stops) || null),
  };
}

function metric(route, names) {
  return names.map((name) => route?.[name]).find((value) => value !== undefined && value !== null);
}

function findOrderedSegment(stopIds, originStopId, destinationStopId) {
  if (!Array.isArray(stopIds) || originStopId == null || destinationStopId == null) return null;

  let best = null;
  stopIds.forEach((stopId, originIndex) => {
    if (String(stopId) !== String(originStopId)) return;
    for (let destinationIndex = originIndex + 1; destinationIndex < stopIds.length; destinationIndex += 1) {
      if (String(stopIds[destinationIndex]) !== String(destinationStopId)) continue;
      const length = destinationIndex - originIndex;
      if (!best || length < best.destinationIndex - best.originIndex) {
        best = { originIndex, destinationIndex };
      }
      break;
    }
  });
  return best;
}

function compressBusNumbers(numbers) {
  return numbers.reduce((unique, number) => {
    if (number != null && String(unique.at(-1)) !== String(number)) unique.push(number);
    return unique;
  }, []);
}

function presentJourney(route, fullJourney, startIndex, endIndex) {
  const stopIds = fullJourney.stopIds.slice(startIndex, endIndex + 1);
  const stops = fullJourney.stops.slice(startIndex, endIndex + 1);
  const stopObjects = fullJourney.stopObjects.slice(startIndex, endIndex + 1);
  const stopRouteNumbers = fullJourney.stopRouteNumbers?.slice(startIndex, endIndex + 1) ?? [];
  const routeNumbers = compressBusNumbers(stopRouteNumbers);
  const isCompleteRoute = startIndex === 0 && endIndex === fullJourney.stopIds.length - 1;
  const source = stops[0] ?? "—";
  const destination = stops.at(-1) ?? "—";
  const sliced = {
    ...route,
    fullJourney,
    stopIds,
    stops,
    stopObjects,
    stopRouteNumbers,
    source,
    destination,
    originStopId: stopIds[0] ?? null,
    destinationStopId: stopIds.at(-1) ?? null,
    totalStops: stopIds.length,
    total_stops: stopIds.length,
    segmentStartIndex: startIndex,
    segmentEndIndex: endIndex,
    // Backend route-level metrics describe the complete service, not an
    // arbitrary boarding-to-alighting segment. Don't present them as segment metrics.
    travelTimeMin: isCompleteRoute ? route.travelTimeMin : null,
    distanceKm: isCompleteRoute ? route.distanceKm : null,
    fare: isCompleteRoute ? route.fare : null,
  };

  if (route.isConnection || route.transferStopId != null) {
    sliced.isConnection = routeNumbers.length > 1;
    sliced.segments = routeNumbers.map((busNumber) => ({ busNumber }));
    sliced.busNumber = routeNumbers.join(" + ") || route.busNumber;
    sliced.routeNumber = sliced.busNumber;
    sliced.routeName = routeNumbers.length > 1
      ? `Bus ${routeNumbers.join(" to ")}`
      : `Bus ${routeNumbers[0] ?? route.busNumber ?? "—"}`;
    const transferIsIncluded = routeNumbers.length > 1
      && stopIds.some((stopId) => String(stopId) === String(route.transferStopId));
    sliced.transferStop = transferIsIncluded ? route.transferStopName : undefined;
  }
  return sliced;
}

/**
 * Return the shortest valid ordered occurrence of an origin/destination pair.
 * The full route arrays are retained so a later destination change can be
 * resolved without changing or truncating the source route data.
 */
export function extractRouteSegment(route, originStopId, destinationStopId) {
  if (!route) return null;
  const fullJourney = route.fullJourney ?? {
    stopIds: route.stopIds ?? [],
    stops: route.stops ?? [],
    stopObjects: route.stopObjects ?? [],
    stopRouteNumbers: route.stopRouteNumbers ?? [],
  };
  const occurrence = findOrderedSegment(fullJourney.stopIds, originStopId, destinationStopId);
  if (!occurrence) return null;
  return presentJourney(route, fullJourney, occurrence.originIndex, occurrence.destinationIndex);
}

export function buildDirectRoute(route, stops, routeStopRecords) {
  const journey = routeStops(route, stops, routeStopRecords);
  const busNumber = route.bus_number ?? route.busNumber ?? route.routeNumber;
  const routeName = route.route_name ?? route.name ?? `Bus ${busNumber ?? "—"}`;
  const fullJourney = {
    ...journey,
    stopRouteNumbers: journey.stopIds.map(() => busNumber),
  };
  return {
    ...route,
    ...journey,
    fullJourney,
    stopRouteNumbers: fullJourney.stopRouteNumbers,
    id: route.id,
    busNumber,
    routeNumber: busNumber,
    routeName,
    source: journey.stops[0] ?? "—",
    destination: journey.stops.at(-1) ?? "—",
    isConnection: false,
    segments: [{ busNumber }],
    travelTimeMin: metric(route, ["travel_time_min", "travelTimeMin"]),
    distanceKm: metric(route, ["distance_km", "distanceKm"]),
    fare: metric(route, ["fare"]),
    totalStops: journey.stopIds.length,
  };
}

export function buildConnectionRoute(connection, stops, routeStopRecords, originStopId, destinationStopId) {
  const firstRoute = connection.from_route ?? connection.first_route ?? connection.routes?.[0];
  const secondRoute = connection.to_route ?? connection.second_route ?? connection.routes?.[1];
  if (!firstRoute || !secondRoute) return null;

  const firstJourney = routeStops(firstRoute, stops, routeStopRecords);
  const secondJourney = routeStops(secondRoute, stops, routeStopRecords);
  const transfer = connection.transfer_stop;
  const transferStopId = transfer?.id ?? transfer;
  if (transferStopId == null) return null;

  const firstSegment = findOrderedSegment(firstJourney.stopIds, originStopId, transferStopId);
  const secondSegment = findOrderedSegment(secondJourney.stopIds, transferStopId, destinationStopId);
  if (!firstSegment || !secondSegment) return null;

  const firstBus = firstRoute.bus_number ?? firstRoute.busNumber;
  const secondBus = secondRoute.bus_number ?? secondRoute.busNumber;
  const firstIndices = { startIndex: firstSegment.originIndex, endIndex: firstSegment.destinationIndex };
  const secondIndices = { startIndex: secondSegment.originIndex, endIndex: secondSegment.destinationIndex };
  const stopIds = [
    ...firstJourney.stopIds.slice(firstIndices.startIndex, firstIndices.endIndex + 1),
    ...secondJourney.stopIds.slice(secondIndices.startIndex + 1, secondIndices.endIndex + 1),
  ];
  const stopObjects = [
    ...firstJourney.stopObjects.slice(firstIndices.startIndex, firstIndices.endIndex + 1),
    ...secondJourney.stopObjects.slice(secondIndices.startIndex + 1, secondIndices.endIndex + 1),
  ];
  const routeStopsById = new Map(stops.map((stop) => [String(stop.id), stop]));
  const stopNames = stopIds.map((stopId) => routeStopsById.get(String(stopId))?.name ?? getStopName(stopId, stops));
  const stopRouteNumbers = [
    ...stopIds.slice(0, firstIndices.endIndex - firstIndices.startIndex + 1).map(() => firstBus),
    ...stopIds.slice(firstIndices.endIndex - firstIndices.startIndex + 1).map(() => secondBus),
  ];
  const fullJourney = { stopIds, stops: stopNames, stopObjects, stopRouteNumbers };
  const transferStopName = transfer?.name ?? getStopName(transferStopId, stops);
  const busNumbers = compressBusNumbers(stopRouteNumbers);
  const busNumber = busNumbers.join(" + ") || [firstBus, secondBus].filter(Boolean).join(" + ");
  const route = {
    ...connection,
    id: connection.id ?? `${firstRoute.id ?? firstBus}-${secondRoute.id ?? secondBus}-${transferStopId}`,
    busNumber,
    routeNumber: busNumber,
    routeName: busNumbers.length > 1 ? `Bus ${busNumbers.join(" to ")}` : `Bus ${busNumbers[0] ?? busNumber}`,
    isConnection: busNumbers.length > 1,
    segments: busNumbers.map((number) => ({ busNumber: number })),
    transferStopId,
    transferStopName,
    transferStop: busNumbers.length > 1 ? transferStopName : undefined,
    fullJourney,
    stopIds,
    stops: stopNames,
    stopObjects,
    stopRouteNumbers,
    source: stopNames[0] ?? "—",
    destination: stopNames.at(-1) ?? "—",
    travelTimeMin: metric(connection, ["travel_time_min", "travelTimeMin"]),
    distanceKm: metric(connection, ["distance_km", "distanceKm"]),
    fare: metric(connection, ["fare"]),
    totalStops: stopIds.length,
    total_stops: stopIds.length,
  };
  return extractRouteSegment(route, originStopId, destinationStopId);
}

export function buildJourneyResults(routeData, stops, routeStopRecords, originStopId, destinationStopId) {
  if (!routeData || !Array.isArray(routeData.direct_routes) || !Array.isArray(routeData.connection_routes)) {
    throw new TypeError("The route search response is invalid.");
  }

  const directRoutes = routeData.direct_routes
    .map((route) => buildDirectRoute(route, stops, routeStopRecords))
    .map((route) => extractRouteSegment(route, originStopId, destinationStopId))
    .filter(Boolean);
  const connectionRoutes = routeData.connection_routes
    .map((route) => buildConnectionRoute(route, stops, routeStopRecords, originStopId, destinationStopId))
    .filter(Boolean);

  return [...directRoutes, ...connectionRoutes];
}
