import Header from "../components/Header";
import { getRouteById, getSearchResults, routes as mockRoutes, stops as mockStops } from "../mockdata";

function formatStopName(stopId) {
  return mockStops.find((item) => item.id === stopId || item.id === Number(stopId))?.name || `Stop ${stopId}`;
}

export default function Results({ currentView, setCurrentView, setSelectedRouteId, sourceStopId, destinationStopId }) {
  const rows = getSearchResults(sourceStopId, destinationStopId).map((result) => {
    const route = getRouteById(result.routeId) || mockRoutes[0];
    return {
      ...result,
      route,
      stopPath: (route?.stopIds || []).map(formatStopName).join(" → "),
      routeBadge: route?.number || "—",
      routeName: route?.name || "Route",
      fare: result.fare ?? route?.fare ?? 0,
    };
  });

  return (
    <div className="app-shell">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="results-page">
        <section className="results-summary">
          <div className="results-summary__left">
            <div className="results-summary__route">{formatStopName(sourceStopId)} → {formatStopName(destinationStopId)}</div>
            <div className="results-summary__meta">LEAVING NOW · {rows.length} BUSES FOUND</div>
          </div>
          <button type="button" className="results-summary__action" onClick={() => setCurrentView("home")}>Edit search</button>
        </section>

        <div className="results-list">
          {rows.map((row) => (
            <article key={row.routeId} className="results-card">
              <div className="results-card__main">
                <div className="results-card__route">
                  <div className="results-card__badge">{row.routeBadge}</div>
                  <div className="results-card__copy">
                    <h3>{row.routeName}</h3>
                    <p>{row.stopPath}</p>
                  </div>
                </div>
              </div>

              <div className="results-card__stats">
                <div className="results-card__stat"><span>Travel time</span><strong>{row.travelTimeMin} min</strong></div>
                <div className="results-card__stat"><span>Distance</span><strong>{row.distanceKm.toFixed(1)} km</strong></div>
                <div className="results-card__stat"><span>Stops</span><strong>{row.stopsCount}</strong></div>
              </div>

              <button
                type="button"
                className="results-card__button"
                onClick={() => { setSelectedRouteId(row.routeId); setCurrentView("detail"); }}
              >
                View route →
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
