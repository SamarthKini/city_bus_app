import test from "node:test";
import assert from "node:assert/strict";
import {
  distanceInMeters,
  findNearestRouteStop,
  resolveRouteDestination,
  shouldTriggerArrivalAlarm,
} from "./stopDistance.js";

test("Haversine distance returns metres for known coordinates", () => {
  assert.equal(distanceInMeters(0, 0, 0, 0), 0);
  const oneDegreeAtEquator = distanceInMeters(0, 0, 0, 1);
  assert.ok(Math.abs(oneDegreeAtEquator - 111195) < 100);
});

test("nearest stop uses normalized GeoDjango coordinates and returns a nearby distance", () => {
  const originalStop = {
    id: 12,
    name: "Nearby stop",
    location: "SRID=4326;POINT (12.879884 74.856952)",
  };
  const nearest = findNearestRouteStop(12.88, 74.857, [originalStop]);

  assert.equal(nearest.id, 12);
  assert.equal(nearest.coordinate_source, "swapped-plausibility");
  assert.ok(nearest.distance_meters > 0 && nearest.distance_meters < 100);
  assert.equal(originalStop.location, "SRID=4326;POINT (12.879884 74.856952)");
});

test("invalid GPS and unverified stops do not produce a nearest distance", () => {
  assert.equal(distanceInMeters(91, 0, 12, 74), null);
  assert.equal(findNearestRouteStop(Number.NaN, 74, []), null);
  assert.equal(findNearestRouteStop(12.88, 74.857, [
    { id: 303, name: "Unverified", location: "SRID=4326;POINT (5.5 6.6)" },
  ]), null);
});

test("destination resolution requires the selected stop to belong to the route", () => {
  const routeStops = [
    { id: 10, name: "Origin", location: "SRID=4326;POINT (12.87 74.85)" },
    { id: 11, name: "Destination", location: "SRID=4326;POINT (12.88 74.86)" },
    { id: 303, name: "Unverified", location: "SRID=4326;POINT (5.5 6.6)" },
  ];
  const selected = resolveRouteDestination(routeStops, "11");
  assert.equal(selected.status, "ready");
  assert.equal(selected.stop.id, 11);
  assert.deepEqual(selected.coordinates, { longitude: 74.86, latitude: 12.88 });
  assert.equal(resolveRouteDestination(routeStops, 99).status, "not-on-route");
  assert.equal(resolveRouteDestination(routeStops, 303).status, "unverified");
  assert.equal(resolveRouteDestination(routeStops, null).status, "unselected");
});

test("arrival alarm threshold is inclusive at 500 metres", () => {
  const ready = {
    monitoring: true,
    destinationIsUsable: true,
    locationIsValid: true,
    hasTriggered: false,
  };
  assert.equal(shouldTriggerArrivalAlarm(499.99, ready), true);
  assert.equal(shouldTriggerArrivalAlarm(500, ready), true);
  assert.equal(shouldTriggerArrivalAlarm(500.01, ready), false);
  assert.equal(shouldTriggerArrivalAlarm(null, ready), false);
  assert.equal(shouldTriggerArrivalAlarm(100, { ...ready, locationIsValid: false }), false);
  assert.equal(shouldTriggerArrivalAlarm(100, { ...ready, destinationIsUsable: false }), false);
  assert.equal(shouldTriggerArrivalAlarm(100, { ...ready, hasTriggered: true }), false);
  assert.equal(shouldTriggerArrivalAlarm(100, { ...ready, monitoring: false }), false);
});
