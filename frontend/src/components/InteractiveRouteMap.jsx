import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { fetchSuggestedRoadSegments } from "../utils/osrmRoute";
import { normalizeStopCoordinates } from "../utils/stopCoordinates";

const OSM_TILE_URL = import.meta.env.VITE_OSM_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

function makeStopIcon(number, endpoint) {
  const endpointClass = endpoint ? ` route-map-marker--${endpoint}` : "";
  return L.divIcon({
    className: "route-leaflet-div-icon",
    html: `<span class="route-map-marker${endpointClass}">${number}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function popupContent(stop) {
  const content = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = `${stop.sequence}. ${stop.name}`;
  content.append(title);
  if (stop.coordinateStatus === "swapped-plausibility") {
    const note = document.createElement("div");
    note.textContent = "Displayed with swapped axes based on the Mangaluru plausibility check.";
    content.append(note);
  }
  if (stop.coordinateStatus === "unverified-stored") {
    const note = document.createElement("div");
    note.textContent = "Shown at stored coordinates without normalization; excluded from suggested road routing.";
    content.append(note);
  }
  return content;
}

export default function InteractiveRouteMap({ stops }) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const [roadState, setRoadState] = useState({ key: null, loading: true, segments: [], failedRuns: 0 });

  const normalizedStops = useMemo(() => stops.map((stop) => {
    const normalized = normalizeStopCoordinates(stop.rawStop);
    return {
      ...stop,
      coordinates: normalized.coordinates,
      storedCoordinates: normalized.storedCoordinates,
      coordinateStatus: normalized.status,
      routable: normalized.routable,
    };
  }), [stops]);
  const mappableStops = useMemo(() => normalizedStops.filter((stop) => stop.coordinates), [normalizedStops]);
  const hasCoordinateGaps = normalizedStops.some((stop) => !stop.coordinates);
  const unverifiedStoredStops = normalizedStops.filter((stop) => stop.coordinateStatus === "unverified-stored");
  const swappedStops = normalizedStops.filter((stop) => stop.coordinateStatus === "swapped-plausibility");
  const hasMappableStops = mappableStops.length > 0;
  const routeKey = JSON.stringify(normalizedStops.map((stop) => [stop.id, stop.coordinateStatus, stop.coordinates]));
  const currentRoadState = roadState.key === routeKey
    ? roadState
    : { loading: true, segments: [], failedRuns: 0 };

  useEffect(() => {
    if (!mapElementRef.current || !hasMappableStops) return undefined;

    const map = L.map(mapElementRef.current, { zoomControl: true });
    L.tileLayer(OSM_TILE_URL, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    const roadLayer = L.layerGroup().addTo(map);
    mapRef.current = { map, markerLayer, roadLayer };
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [hasMappableStops]);

  useEffect(() => {
    const current = mapRef.current;
    if (!current) return;

    current.markerLayer.clearLayers();
    current.roadLayer.clearLayers();
    const boundsPoints = [];

    mappableStops.forEach((stop) => {
      const { latitude, longitude } = stop.coordinates;
      const endpoint = stop.sequence === 1
        ? "origin"
        : stop.sequence === normalizedStops.length ? "destination" : "";
      const marker = L.marker([latitude, longitude], {
        icon: makeStopIcon(stop.sequence, endpoint),
        title: `${stop.sequence}. ${stop.name}`,
        alt: `Stop ${stop.sequence}: ${stop.name}`,
      }).bindPopup(popupContent(stop));
      marker.addTo(current.markerLayer);
      boundsPoints.push([latitude, longitude]);
    });

    currentRoadState.segments.forEach((segment) => {
      L.polyline(segment, { color: "#1677f8", weight: 5, opacity: 0.86 }).addTo(current.roadLayer);
      boundsPoints.push(...segment);
    });

    if (boundsPoints.length === 1) current.map.setView(boundsPoints[0], 14);
    else if (boundsPoints.length > 1) current.map.fitBounds(boundsPoints, { padding: [32, 32] });
    window.setTimeout(() => current.map.invalidateSize(), 0);
  }, [mappableStops, normalizedStops.length, currentRoadState.segments]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSuggestedRoadSegments(normalizedStops, controller.signal)
      .then(({ segments, failedRuns }) => setRoadState({ key: routeKey, loading: false, segments, failedRuns }))
      .catch((error) => {
        if (error.name !== "AbortError") setRoadState({ key: routeKey, loading: false, segments: [], failedRuns: 1 });
      });
    return () => controller.abort();
  }, [normalizedStops, routeKey]);

  if (mappableStops.length === 0) {
    return <div className="route-map-empty">No verified stop coordinates are available to center this map. No markers or route line are shown.</div>;
  }

  return (
    <div className="route-map-view">
      <div className="route-map-frame" ref={mapElementRef} aria-label="Interactive OpenStreetMap showing route stops" />
      <div className="route-map-overlay route-map-legend" aria-label="Map legend">
        <strong>Route stops</strong>
        <span><i className="route-map-legend__dot route-map-legend__dot--origin" />Origin</span>
        <span><i className="route-map-legend__dot" />Stop</span>
        <span><i className="route-map-legend__dot route-map-legend__dot--destination" />Destination</span>
      </div>
      <div className="route-map-overlay route-map-status" role="status">
        <strong>Suggested driving path</strong>
        {currentRoadState.loading && <span>Finding road routes between consecutive stops...</span>}
        {!currentRoadState.loading && currentRoadState.failedRuns > 0 && <span>Road routing failed for {currentRoadState.failedRuns} sequence section{currentRoadState.failedRuns === 1 ? "" : "s"}. No line is shown for failed sections.</span>}
        {!currentRoadState.loading && currentRoadState.failedRuns === 0 && currentRoadState.segments.length > 0 && <span>OSRM driving route; it may differ from the bus's actual path.</span>}
        {!currentRoadState.loading && currentRoadState.failedRuns === 0 && currentRoadState.segments.length === 0 && <span>{hasCoordinateGaps ? "Route line stops at coordinates that could not be verified." : "No consecutive verified stop pair is available for road routing."}</span>}
        {hasCoordinateGaps && <span>Some stops remain in the timeline but have no map marker; the route is not connected across them.</span>}
        {unverifiedStoredStops.length > 0 && <span role="alert">{unverifiedStoredStops.map((stop) => `${stop.name} (ID ${stop.id})`).join(" and ")} use stored coordinates as-is and are excluded from OSRM routing. The map may include distant points; no route line connects across them.</span>}
      </div>
      {import.meta.env.DEV && swappedStops.length > 0 && (
        <details className="route-map-diagnostics">
          <summary>Coordinate normalization diagnostics ({swappedStops.length})</summary>
          <ul>
            {swappedStops.map((stop) => (
              <li key={stop.id}>
                {stop.name} (ID {stop.id}): stored x/y {stop.storedCoordinates.longitude}, {stop.storedCoordinates.latitude}; displayed longitude/latitude {stop.coordinates.longitude}, {stop.coordinates.latitude}.
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="route-map-attribution">Suggested road geometry by OSRM. Map data © OpenStreetMap contributors.</p>
    </div>
  );
}
