import Header from "../components/Header";
import { buildGoogleMapsRouteUrl } from "../utils/mapsLink";

export default function RouteDetail({ currentView, setCurrentView, route }) {
  if (!route) {
    return <div className="app-shell"><Header currentView={currentView} setCurrentView={setCurrentView} /><main className="route-detail-page"><section className="detail-card"><h1>Route unavailable</h1><p>No route data was received from the backend.</p><button type="button" className="detail-button detail-button--secondary" onClick={() => setCurrentView("home")}>Back to search</button></section></main></div>;
  }
  const stops = route.stops || [];
  const mapUrl = buildGoogleMapsRouteUrl(route.stopObjects || []);
  const routeLabel = route.routeName || `Bus ${route.busNumber ?? route.routeNumber ?? "—"}`;

  return (
    <div className="app-shell">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="route-detail-page"><div className="route-detail-layout">
        <section className="detail-card route-detail-card"><div className="detail-card__header"><div>
          <div className="detail-kicker">Route details</div><h1>{routeLabel}</h1>
          <p>{route.source ?? "—"} → {route.destination ?? "—"} · {stops.length} stops · {route.isConnection ? "Transfer route" : "Direct route"}</p>
          {route.transferStop && <p>Transfer at {route.transferStop}</p>}
        </div><div className="detail-actions">
          <button type="button" className="detail-button detail-button--secondary" onClick={() => setCurrentView("home")}>Back to results</button>
          <button type="button" className="detail-button detail-button--primary" onClick={() => setCurrentView("live")}>Start journey</button>
          <button type="button" className="detail-button detail-button--map" disabled={!mapUrl} onClick={() => mapUrl && window.open(mapUrl, "_blank", "noopener,noreferrer")}>{mapUrl ? "Open in Google Maps" : "Map unavailable"}</button>
        </div></div></section>
        <section className="detail-card route-stops-card"><div className="detail-card__header route-stops-card__header"><h2>Stops along the route</h2></div>
          {stops.length === 0 ? <p>Stop information is not available for this route.</p> : <ol className="route-stop-list">{stops.map((stop, index) => {
            const isOrigin = index === 0;
            const isDestination = index === stops.length - 1;
            const isTransfer = route.transferStop === stop;
            return <li key={`${route.stopIds?.[index] ?? stop}-${index}`} className={`route-stop${isOrigin || isDestination ? " route-stop--endpoint" : ""}${isDestination ? " route-stop--destination" : ""}`}><span className="route-stop__number">{index + 1}</span><span className="route-stop__marker" aria-hidden="true" /><div className="route-stop__content"><strong>{stop}</strong>{isOrigin && <span className="route-stop__hint">(Origin)</span>}{isTransfer && <span className="route-stop__hint">(Transfer)</span>}{isDestination && <span className="route-stop__destination-label">Destination</span>}</div></li>;
          })}</ol>}
        </section>
      </div></main>
    </div>
  );
}
