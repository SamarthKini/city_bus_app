import test from "node:test";
import assert from "node:assert/strict";
import { buildConnectionRoute, buildDirectRoute, buildJourneyResults, extractRouteSegment } from "./routeData.js";
import { resolveRouteDestination } from "./stopDistance.js";
import { buildGoogleMapsRouteUrl } from "./mapsLink.js";
import { fetchSuggestedRoadSegments } from "./osrmRoute.js";
import { normalizeStopCoordinates } from "./stopCoordinates.js";

const stop = (id, name, location = "SRID=4326;POINT (12.87 74.85)") => ({ id, name, location });

function directRoute(routeId, stopIds, stops) {
  const route = buildDirectRoute({ id: routeId, bus_number: `B${routeId}`, distance_km: 18, fare: 25 }, stops, stopIds.map((id, index) => ({
    route: routeId,
    stop: id,
    sequence: index + 1,
  })));
  return route;
}

test("route segments dynamically include selected origin and destination in route order", () => {
  const stops = [stop(1, "A"), stop(2, "B"), stop(3, "C"), stop(4, "D"), stop(5, "E")];
  const fullRoute = directRoute(10, [1, 2, 3, 4, 5], stops);

  const intermediate = extractRouteSegment(fullRoute, 2, 4);
  assert.deepEqual(intermediate.stopIds, [2, 3, 4]);
  assert.deepEqual(intermediate.stops, ["B", "C", "D"]);
  assert.equal(intermediate.source, "B");
  assert.equal(intermediate.destination, "D");
  assert.equal(intermediate.totalStops, 3);
  assert.equal(intermediate.distanceKm, null);

  const terminal = extractRouteSegment(fullRoute, 2, 5);
  assert.deepEqual(terminal.stopIds, [2, 3, 4, 5]);
  assert.equal(terminal.destination, "E");
  assert.equal(terminal.totalStops, 4);
  assert.equal(extractRouteSegment(fullRoute, 4, 2), null);
  assert.equal(extractRouteSegment(fullRoute, 2, 99), null);
});

test("intermediate origins and multiple routes serving a pair remain independently ordered", () => {
  const stops = [stop(1, "A"), stop(2, "B"), stop(3, "C"), stop(4, "D"), stop(5, "E")];
  const routeOne = directRoute(11, [1, 2, 3, 4, 5], stops);
  const routeTwo = directRoute(12, [2, 5, 4, 3], stops);
  const journeys = [routeOne, routeTwo]
    .map((route) => extractRouteSegment(route, 2, 4))
    .filter(Boolean);

  assert.equal(journeys.length, 2);
  assert.deepEqual(journeys[0].stopIds, [2, 3, 4]);
  assert.deepEqual(journeys[1].stopIds, [2, 5, 4]);
  assert.equal(journeys[0].originStopId, 2);
  assert.equal(journeys[0].destinationStopId, 4);
});

test("repeated stop occurrences choose the shortest forward segment without mutating route data", () => {
  const stops = [stop(1, "A"), stop(2, "B"), stop(3, "C"), stop(4, "D")];
  const fullRoute = directRoute(13, [1, 2, 3, 4, 1, 4], stops);
  const originalIds = [...fullRoute.stopIds];

  const journey = extractRouteSegment(fullRoute, 1, 4);
  assert.deepEqual(journey.stopIds, [1, 4]);
  assert.deepEqual(fullRoute.stopIds, originalIds);
  assert.deepEqual(fullRoute.fullJourney.stopIds, originalIds);
});

test("connection routes trim both legs to the ordered origin, transfer, and destination", () => {
  const stops = [stop(1, "Before origin"), stop(2, "Origin"), stop(3, "Transfer"), stop(4, "Destination"), stop(5, "After destination")];
  const routeStops = [
    { route: 20, stop: 1, sequence: 1 },
    { route: 20, stop: 2, sequence: 2 },
    { route: 20, stop: 3, sequence: 3 },
    { route: 20, stop: 5, sequence: 4 },
    { route: 21, stop: 1, sequence: 1 },
    { route: 21, stop: 3, sequence: 2 },
    { route: 21, stop: 4, sequence: 3 },
    { route: 21, stop: 5, sequence: 4 },
  ];
  const journey = buildConnectionRoute({
    from_route: { id: 20, bus_number: "X" },
    to_route: { id: 21, bus_number: "Y" },
    transfer_stop: stops.find((item) => item.id === 3),
  }, stops, routeStops, 2, 4);

  assert.deepEqual(journey.stopIds, [2, 3, 4]);
  assert.deepEqual(journey.stopRouteNumbers, ["X", "X", "Y"]);
  assert.deepEqual(journey.segments, [{ busNumber: "X" }, { busNumber: "Y" }]);
  assert.equal(journey.transferStop, "Transfer");
  assert.equal(journey.destination, "Destination");
  assert.equal(journey.totalStops, 3);
});

test("journey search returns all matching direct routes with the selected endpoints", () => {
  const stops = [stop(1, "Origin"), stop(2, "Middle"), stop(3, "Destination"), stop(4, "Later terminal")];
  const routeStops = [
    { route: 30, stop: 1, sequence: 1 }, { route: 30, stop: 2, sequence: 2 },
    { route: 30, stop: 3, sequence: 3 }, { route: 30, stop: 4, sequence: 4 },
    { route: 31, stop: 1, sequence: 1 }, { route: 31, stop: 3, sequence: 2 },
  ];
  const results = buildJourneyResults({
    direct_routes: [{ id: 30, bus_number: "30" }, { id: 31, bus_number: "31" }],
    connection_routes: [],
  }, stops, routeStops, 1, 3);

  assert.equal(results.length, 2);
  assert.deepEqual(results.map((journey) => journey.destinationStopId), [3, 3]);
  assert.deepEqual(results[0].stopIds, [1, 2, 3]);
});

test("journey search returns valid connections when no direct buses are available", () => {
  const stops = [stop(1, "Origin"), stop(2, "Transfer"), stop(3, "Destination")];
  const routeStops = [
    { route: 40, stop: 1, sequence: 1 }, { route: 40, stop: 2, sequence: 2 },
    { route: 41, stop: 2, sequence: 1 }, { route: 41, stop: 3, sequence: 2 },
  ];
  const results = buildJourneyResults({
    direct_routes: [],
    connection_routes: [{
      from_route: { id: 40, bus_number: "A" },
      to_route: { id: 41, bus_number: "B" },
      transfer_stop: stops[1],
    }],
  }, stops, routeStops, 1, 3);

  assert.equal(results.length, 1);
  assert.equal(results[0].isConnection, true);
  assert.equal(results[0].transferStop, "Transfer");
  assert.equal(results[0].destinationStopId, 3);
});

test("journey search completes empty and rejects malformed API responses", () => {
  assert.deepEqual(buildJourneyResults({ direct_routes: [], connection_routes: [] }, [], [], 1, 2), []);
  assert.throws(() => buildJourneyResults({}, [], [], 1, 2), /response is invalid/);
});

test("map directions and arrival destination resolve to the same selected segment endpoint", () => {
  const stops = [
    stop(31, "Origin", "SRID=4326;POINT (12.87 74.85)"),
    stop(32, "Intermediate", "SRID=4326;POINT (12.88 74.86)"),
    stop(33, "Selected destination", "SRID=4326;POINT (12.89 74.87)"),
    stop(34, "Later terminal", "SRID=4326;POINT (12.90 74.88)"),
  ];
  const journey = extractRouteSegment(directRoute(14, [31, 32, 33, 34], stops), 31, 33);
  const alarmDestination = resolveRouteDestination(journey.stopObjects, journey.destinationStopId);
  const directions = new URL(buildGoogleMapsRouteUrl(journey.stopObjects));
  const displayedStopIds = journey.stopObjects.map((item) => item.id);

  assert.deepEqual(displayedStopIds, [31, 32, 33]);
  assert.equal(alarmDestination.stop.id, 33);
  assert.equal(alarmDestination.stop.name, journey.destination);
  assert.equal(directions.searchParams.get("destination"), "12.89,74.87");
  assert.notEqual(directions.searchParams.get("destination"), "12.9,74.88");
});

test("suggested road geometry receives only the selected journey segment", async () => {
  const stops = [
    stop(51, "Origin", "SRID=4326;POINT (12.87 74.85)"),
    stop(52, "Intermediate", "SRID=4326;POINT (12.88 74.86)"),
    stop(53, "Selected destination", "SRID=4326;POINT (12.89 74.87)"),
    stop(54, "Later terminal", "SRID=4326;POINT (12.90 74.88)"),
  ];
  const journey = extractRouteSegment(directRoute(16, [51, 52, 53, 54], stops), 51, 53);
  const mapStops = journey.stopObjects.map((rawStop, index) => {
    const normalized = normalizeStopCoordinates(rawStop);
    return { id: rawStop.id, sequence: index + 1, coordinates: normalized.coordinates, routable: normalized.routable };
  });
  const originalFetch = globalThis.fetch;
  const requestedUrls = [];
  globalThis.fetch = async (url) => {
    requestedUrls.push(String(url));
    return { ok: true, json: async () => ({ code: "Ok", routes: [{ geometry: { coordinates: [[74.85, 12.87], [74.86, 12.88], [74.87, 12.89]] } }] }) };
  };
  try {
    const result = await fetchSuggestedRoadSegments(mapStops, new AbortController().signal);
    assert.equal(result.segments.length, 1);
    assert.equal(requestedUrls.length, 1);
    assert.match(requestedUrls[0], /74\.85,12\.87;74\.86,12\.88;74\.87,12\.89/);
    assert.doesNotMatch(requestedUrls[0], /74\.88,12\.9/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("invalid and unverified stop locations stay in the journey sequence", () => {
  const stops = [
    stop(41, "Origin"),
    stop(303, "Unverified stop", "SRID=4326;POINT (5.5 6.6)"),
    stop(43, "Destination"),
  ];
  const journey = extractRouteSegment(directRoute(15, [41, 303, 43], stops), 41, 43);
  const alarmDestination = resolveRouteDestination(journey.stopObjects, 303);

  assert.deepEqual(journey.stopIds, [41, 303, 43]);
  assert.equal(alarmDestination.status, "unverified");
  assert.equal(journey.stopObjects[1].id, 303);
});
