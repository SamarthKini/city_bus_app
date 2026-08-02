export const stops = [
  { id: "stp_001", name: "State Bank Bus Stand", area: "Hampankatta", latitude: 12.8698, longitude: 74.8420 },
  { id: "stp_002", name: "Hampankatta",           area: "Hampankatta", latitude: 12.8686, longitude: 74.8408 },
  { id: "stp_003", name: "Balmatta",              area: "Balmatta",    latitude: 12.8720, longitude: 74.8447 },
  { id: "stp_004", name: "Jyothi",                area: "Kankanady",   latitude: 12.8746, longitude: 74.8479 },
  { id: "stp_005", name: "Kankanady",             area: "Kankanady",   latitude: 12.8772, longitude: 74.8511 },
  { id: "stp_006", name: "Pumpwell",              area: "Pumpwell",    latitude: 12.8801, longitude: 74.8545 },
  { id: "stp_007", name: "Nagori",                area: "Kankanady",   latitude: 12.8830, longitude: 74.8578 },
  { id: "stp_008", name: "Padil",                 area: "Padil",       latitude: 12.8862, longitude: 74.8612 },
  { id: "stp_009", name: "Kannurbettu",           area: "Padil",       latitude: 12.8891, longitude: 74.8646 },
  { id: "stp_010", name: "Jyothi Circle",         area: "Padil",       latitude: 12.8862, longitude: 74.8612 },
  { id: "stp_011", name: "Kadri Temple",          area: "Kadri",       latitude: 12.8814, longitude: 74.8460 },
  { id: "stp_012", name: "Kadri Kambla",          area: "Kadri",       latitude: 12.8838, longitude: 74.8489 },
  { id: "stp_013", name: "Bejai Kapikad",         area: "Bejai",       latitude: 12.8899, longitude: 74.8501 },
  { id: "stp_014", name: "Attavar",               area: "Attavar",     latitude: 12.8712, longitude: 74.8433 },
  { id: "stp_015", name: "Ballalbagh",            area: "Ballalbagh",  latitude: 12.8756, longitude: 74.8465 },
  { id: "stp_016", name: "Surathkal",             area: "Surathkal",   latitude: 13.0100, longitude: 74.7938 },
  { id: "stp_017", name: "Deralakatte",           area: "Deralakatte", latitude: 12.9033, longitude: 74.8890 },
  { id: "stp_018", name: "Mannagudda",            area: "Mannagudda",  latitude: 12.8645, longitude: 74.8390 },
  { id: "stp_019", name: "Adyar",                 area: "Adyar",       latitude: 12.8922, longitude: 74.8679 },
  { id: "stp_020", name: "Urwa",                  area: "Urwa",        latitude: 12.8834, longitude: 74.8354 },
  { id: "stp_021", name: "Adyar Launch Jetty",    area: "Adyar",       latitude: 12.8951, longitude: 74.8710 },
];
 
// ---------------------------------------------------------------
// 2. ROUTES — used on "All routes" and the popular-routes cards
// ---------------------------------------------------------------
export const routes = [
  {
    id: "rt_45",
    number: "45",
    name: "City Express",
    direct: true,
    frequencyMin: 12,
    fare: 18,
    distanceKm: 9.0,
    travelTimeMin: 30,
    stopIds: ["stp_001", "stp_003", "stp_004", "stp_005", "stp_006", "stp_007", "stp_008", "stp_009", "stp_019", "stp_021"],
  },
  {
    id: "rt_12a",
    number: "12A",
    name: "Kadri – Bejai Link",
    direct: true,
    frequencyMin: 18,
    fare: 14,
    distanceKm: 8.2,
    travelTimeMin: 41,
    stopIds: ["stp_011", "stp_012", "stp_014", "stp_015", "stp_013"],
  },
  {
    id: "rt_7",
    number: "7",
    name: "Surathkal Direct",
    direct: true,
    frequencyMin: 20,
    fare: 20,
    distanceKm: 9.6,
    travelTimeMin: 35,
    stopIds: ["stp_002", "stp_014", "stp_016"],
  },
];
 
// ---------------------------------------------------------------
// 3. SEARCH RESULTS — what the "Results" page renders after
//    a source + destination are chosen. Keyed by "sourceId-destId"
//    so you can look up a mock response the same way you'd hit an API.
// ---------------------------------------------------------------
export const searchResultsByPair = {
  "stp_001-stp_010": [
    {
      routeId: "rt_45",
      recommended: true,
      transferCount: 0,
      travelTimeMin: 30,
      distanceKm: 9.0,
      stopsCount: 10,
      fare: 18,
      nextDepartures: ["Now", "8 min", "15 min"],
    },
    {
      routeId: "rt_12a",
      recommended: false,
      transferCount: 1,
      travelTimeMin: 41,
      distanceKm: 8.2,
      stopsCount: 13,
      fare: 14,
      nextDepartures: ["4 min", "19 min"],
    },
    {
      routeId: "rt_7",
      recommended: false,
      transferCount: 0,
      travelTimeMin: 35,
      distanceKm: 9.6,
      stopsCount: 11,
      fare: 20,
      nextDepartures: ["12 min", "27 min"],
    },
  ],
};
 
// Fallback used for any source/destination pair not explicitly mocked above,
// so the UI never renders empty while you're still wiring up the real API.
export const defaultSearchResults = searchResultsByPair["stp_001-stp_010"];
 
export function getSearchResults(sourceId, destId) {
  const key = `${sourceId}-${destId}`;
  return searchResultsByPair[key] || defaultSearchResults;
}
 
// ---------------------------------------------------------------
// 4. ROUTE DETAIL — full stop-by-stop timeline for the Route Detail page.
//    "tag" here is the route's own fixed markers (origin/terminus of the
//    physical route). Which stop is "Your Start" / "Your Destination" for
//    a given rider is computed at render time from their search — see
//    getJourneyStops() below.
// ---------------------------------------------------------------
export const routeDetailByRouteId = {
  rt_45: {
    routeId: "rt_45",
    currentStopId: "stp_007", // used to show "bus is here" marker
    stops: [
      { stopId: "stp_001", name: "State Bank Bus Stand", eta: "9:54 AM",  tag: "origin" },
      { stopId: "stp_003", name: "Balmatta",              eta: "9:58 AM",  tag: null },
      { stopId: "stp_004", name: "Jyothi",                eta: "10:02 AM", tag: null },
      { stopId: "stp_005", name: "Kankanady",             eta: "10:06 AM", tag: null },
      { stopId: "stp_006", name: "Pumpwell",              eta: "10:11 AM", tag: null },
      { stopId: "stp_007", name: "Nagori",                eta: "10:15 AM", tag: "current" },
      { stopId: "stp_008", name: "Padil",                 eta: "10:19 AM", tag: null },
      { stopId: "stp_009", name: "Kannurbettu",           eta: "10:23 AM", tag: null },
      { stopId: "stp_019", name: "Adyar",                 eta: "10:28 AM", tag: null },
      { stopId: "stp_021", name: "Adyar Launch Jetty",    eta: "10:34 AM", tag: "terminus" },
    ],
  },
};
 
// Given a route's stop list plus the rider's chosen source/destination stop
// ids, returns the stops annotated with "Your Start" / "Your Destination" —
// this is what powers the "All Stops" list design (bottom-sheet style).
// Works the same way once real API data is used, as long as the route's
// stop order and the rider's source/destination ids are passed in the
// same shape.
export function getJourneyStops(routeId, sourceStopId, destinationStopId) {
  const detail = routeDetailByRouteId[routeId];
  if (!detail) return [];
 
  return detail.stops.map((stop, index) => ({
    ...stop,
    sequence: index + 1,
    isYourStart: stop.stopId === sourceStopId,
    isYourDestination: stop.stopId === destinationStopId,
    isCurrentBusPosition: stop.stopId === detail.currentStopId,
  }));
}
 
// ---------------------------------------------------------------
// 5. LIVE TRACKING — sample state for the Live Tracking page.
//    `destinationStopId` + the stop's lat/lng (via getStopById) is what
//    the 200m arrival alarm compares the rider's live GPS position against.
//    Swap this object for a real API response later — same field names.
// ---------------------------------------------------------------
export const liveTrackingSample = {
  routeId: "rt_45",
  vehicleNumber: "KA 19 F 4021",
  seatsAvailable: 34,
  seatsTotal: 42,
  sourceStopId: "stp_019",       // rider's boarding stop ("Currently at" in the reference design)
  currentStopId: "stp_007",      // bus's current position along the route
  nextStopId: "stp_008",
  destinationStopId: "stp_001",  // rider's chosen destination — alarm fires near this stop's coordinates
  nextStopDistanceM: 350,
  etaMinutes: 8,
  distanceToDestinationKm: 2.6,
  etaTime: "10:24 AM",
  alarmEnabled: true,
  alarmRadiusM: 200,
};
 
// ---------------------------------------------------------------
// Helper: resolve a stopId to its stop object, since most of the
// mock data above stores ids rather than full nested objects
// (this mirrors how a real normalized API response usually looks).
// ---------------------------------------------------------------
export function getStopById(stopId) {
  return stops.find((s) => s.id === stopId) || null;
}
 
 
export function getRouteById(routeId) {
  return routes.find((r) => r.id === routeId) || null;
}
 
// ---------------------------------------------------------------
// Distance helper for the live-location arrival alarm.
// Returns distance in meters between two lat/lng points (Haversine formula).
// Works identically whether the coordinates come from mock stops or real
// ones from your Django API — it only needs { latitude, longitude } shape.
// ---------------------------------------------------------------
export function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
 