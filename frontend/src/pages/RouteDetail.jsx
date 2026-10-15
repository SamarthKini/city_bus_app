import { useMemo } from "react";
import Header from "../components/Header";
import InteractiveRouteMap from "../components/InteractiveRouteMap";
import { buildGoogleMapsRouteUrl } from "../utils/mapsLink";
import { normalizeStopCoordinates } from "../utils/stopCoordinates";

const EMPTY_STOPS = [];

export default function RouteDetail({ currentView, setCurrentView, route, onBackToResults }) {
  const stops = route?.stops ?? EMPTY_STOPS;
  const stopEntries = useMemo(() => stops.map((name, index) => ({
    id: route?.stopIds?.[index] ?? route?.stopObjects?.[index]?.id ?? null,
    name,
    sequence: index + 1,
    rawStop: route?.stopObjects?.[index] ?? null,
  })), [route, stops]);

  if (!route) {
    return (
      <div className="app-shell">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        <main className="route-detail-page">
          <section className="detail-card">
            <h1>Route unavailable</h1>
            <p>No route data was received from the backend.</p>
            <button type="button" className="detail-button detail-button--secondary" onClick={onBackToResults ?? (() => setCurrentView("home"))}>
              Back to search
            </button>
          </section>
        </main>
      </div>
    );
  }

  const mapUrl = buildGoogleMapsRouteUrl(stopEntries.map((stop) => stop.rawStop));
  const routeLabel = route.routeName || `Bus ${route.busNumber ?? route.routeNumber ?? "—"}`;

  return (
    <div className="app-shell">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="route-detail-page">
        <div className="route-detail-layout">
          <section className="detail-card route-detail-card">
            <div className="detail-card__header">
              <div>
                <div className="detail-kicker">Route details</div>
                <h1>{routeLabel}</h1>
                <p>{route.source ?? "—"} → {route.destination ?? "—"} · {stops.length} stops · {route.isConnection ? "Transfer route" : "Direct route"}</p>
                {route.transferStop && <p>Transfer at {route.transferStop}</p>}
              </div>
              <div className="detail-actions">
                <button type="button" className="detail-button detail-button--secondary" onClick={onBackToResults ?? (() => setCurrentView("home"))}>Back to results</button>
                <button type="button" className="detail-button detail-button--primary" onClick={() => setCurrentView("live")}>Start journey</button>
                <button type="button" className="detail-button detail-button--map" disabled={!mapUrl} onClick={() => mapUrl && window.open(mapUrl, "_blank", "noopener,noreferrer")}>{mapUrl ? "Open map" : "Map unavailable"}</button>
              </div>
            </div>
          </section>

          <section className="detail-card route-stops-card">
            <div className="detail-card__header route-stops-card__header"><h2>Stops along the route</h2></div>
            {stopEntries.length === 0 ? <p>Stop information is not available for this route.</p> : (
              <ol className="route-stop-list">
                {stopEntries.map((entry, index) => {
                  const isOrigin = index === 0;
                  const isDestination = index === stopEntries.length - 1;
                  const isTransfer = route.transferStop === entry.name;
                  const coordinateStatus = normalizeStopCoordinates(entry.rawStop).status;
                  const locationUnavailable = !["original", "swapped-plausibility", "unverified-stored"].includes(coordinateStatus);
                  return (
                    <li key={`${entry.id ?? entry.name}-${index}`} className={`route-stop${isOrigin ? " route-stop--origin" : ""}${isDestination ? " route-stop--destination" : ""}`}>
                      <span className="route-stop__number">{entry.sequence}</span>
                      <span className="route-stop__marker" aria-hidden="true" />
                      <div className="route-stop__content">
                        <strong>{entry.name}</strong>
                        {isOrigin && <span className="route-stop__hint">(Origin)</span>}
                        {isTransfer && <span className="route-stop__hint">(Transfer)</span>}
                        {isDestination && <span className="route-stop__destination-label">Destination</span>}
                        {locationUnavailable && <span className="route-stop__location-note">Location not mapped</span>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className="detail-card route-map-card" aria-label="Route map">
            <InteractiveRouteMap stops={stopEntries} />
            <button type="button" className="detail-button detail-button--map route-map-card__action" disabled={!mapUrl} onClick={() => mapUrl && window.open(mapUrl, "_blank", "noopener,noreferrer")}>
              {mapUrl ? "Open in Google Maps" : "Map unavailable"}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
