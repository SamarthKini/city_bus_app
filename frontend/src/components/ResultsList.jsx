import { useMemo } from "react";
import { LoaderCircle } from "lucide-react";
import { getRouteSearchView } from "../utils/routeSearchView";

function displayMetric(value, suffix, formatter = (metric) => metric) {
  return value === undefined || value === null ? "—" : `${formatter(value)}${suffix}`;
}

export default function ResultsList({ routes = [], sourceStop, destinationStop, status, error, onRetry, onChangeStops, onViewRoute }) {
  const view = getRouteSearchView(status, routes);
  const sourceName = useMemo(() => routes.find((route) => route.source)?.source || sourceStop || "Source", [routes, sourceStop]);
  const destinationName = useMemo(() => routes.find((route) => route.destination)?.destination || destinationStop || "Destination", [routes, destinationStop]);

  if (view === "loading") {
    return (
      <section className="results-shell fade-up" aria-live="polite" aria-busy="true">
        <div className="surface-card results-loading">
          <LoaderCircle className="results-loading__spinner" size={25} aria-hidden="true" />
          <div><h3>Finding buses for your journey…</h3><p>Checking direct and connection routes.</p></div>
        </div>
      </section>
    );
  }

  if (view === "error") {
    return (
      <section className="results-shell fade-up" aria-live="polite">
        <div className="surface-card results-error"><h3>We couldn’t find routes</h3><p>{error || "Please try your search again."}</p><button type="button" className="primary-button" onClick={onRetry}>Retry search</button></div>
      </section>
    );
  }

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
          <div className="surface-card empty-results-panel"><div><h3>No buses available</h3><p>No direct or connecting bus routes were found between your selected stops. Try different stops.</p></div><button type="button" className="empty-results-panel__button" onClick={onChangeStops}>Edit stops</button></div>
        ) : routes.map((route, index) => (
          <article key={route.id ?? `${route.routeNumber}-${index}`} className="results-card">
            <div className="results-card__main"><div className="results-card__route">
              <div className="results-card__badge">{route.routeNumber ?? route.busNumber ?? "—"}</div>
              <div className="results-card__copy">
                <h3>{route.routeName ?? `Bus ${route.busNumber ?? "—"}`}</h3>
                <p>{route.stops?.length ? route.stops.join(" → ") : "Stops not available"}</p>
                {route.isConnection && <p>Connecting route</p>}
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
