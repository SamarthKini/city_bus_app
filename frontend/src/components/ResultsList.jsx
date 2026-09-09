import { useMemo } from "react";

function displayMetric(value, suffix, formatter = (metric) => metric) {
  return value === undefined || value === null ? "—" : `${formatter(value)}${suffix}`;
}

export default function ResultsList({ routes = [], sourceStop, destinationStop, onViewRoute }) {
  const sourceName = useMemo(() => routes.find((route) => route.source)?.source || sourceStop || "Source", [routes, sourceStop]);
  const destinationName = useMemo(() => routes.find((route) => route.destination)?.destination || destinationStop || "Destination", [routes, destinationStop]);

  return (
    <section className="results-shell fade-up">
      <div className="results-summary">
        <div className="results-summary__left">
          <div className="results-summary__route">{sourceName} → {destinationName}</div>
          <div className="results-summary__meta">LEAVING NOW · {routes.length} {routes.length === 1 ? "BUS" : "BUSES"} FOUND</div>
        </div>
      </div>
      <div className="results-list">
        {routes.length === 0 ? (
          <div className="surface-card"><h3>No routes found</h3><p>No bus route is available between the selected stops.</p></div>
        ) : routes.map((route, index) => (
          <article key={route.id ?? `${route.routeNumber}-${index}`} className="results-card">
            <div className="results-card__main"><div className="results-card__route">
              <div className="results-card__badge">{route.routeNumber ?? route.busNumber ?? "—"}</div>
              <div className="results-card__copy">
                <h3>{route.routeName ?? `Bus ${route.busNumber ?? "—"}`}</h3>
                <p>{route.stops?.length ? route.stops.join(" → ") : "Stops not available"}</p>
                {route.transferStop && <p>Transfer at {route.transferStop}</p>}
              </div>
            </div></div>
            <div className="results-card__stats">
              <div className="results-card__stat"><span>Travel time</span><strong>{displayMetric(route.travelTimeMin, " min")}</strong></div>
              <div className="results-card__stat"><span>Distance</span><strong>{displayMetric(route.distanceKm, " km", (value) => Number(value).toFixed(1))}</strong></div>
              <div className="results-card__stat"><span>Stops</span><strong>{route.stops?.length ?? "—"}</strong></div>
              <div className="results-card__stat"><span>Fare</span><strong>{displayMetric(route.fare, "")}</strong></div>
            </div>
            <button type="button" className="results-card__button" onClick={() => onViewRoute?.(route)}>View route →</button>
          </article>
        ))}
      </div>
    </section>
  );
}
