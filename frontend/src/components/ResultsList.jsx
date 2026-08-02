import { useMemo } from "react";
import {
  defaultSearchResults,
  getSearchResults,
  routes as mockRoutes,
  stops as mockStops,
} from "../mockdata";

function formatStopName(stopId) {
  const stop = mockStops.find((item) => item.id === stopId || item.id === Number(stopId));
  return stop ? stop.name : `Stop ${stopId}`;
}

function getRouteMatch(route) {
  return mockRoutes.find((item) => String(item.number).toLowerCase() === String(route.busNumber).toLowerCase());
}

export default function ResultsList({ routes, sourceStop, destinationStop, onViewFullRoute }) {
  const sourceName = formatStopName(sourceStop);
  const destinationName = formatStopName(destinationStop);

  const mockResults = useMemo(() => getSearchResults(sourceStop, destinationStop), [sourceStop, destinationStop]);
  const fallbackResults = defaultSearchResults;

  const mergedRoutes = useMemo(() => {
    return routes.map((route) => {
      const mockRoute = getRouteMatch(route);
      const matchingResult =
        mockResults.find((item) => item.routeId === mockRoute?.id) ||
        fallbackResults.find((item) => item.routeId === mockRoute?.id) ||
        fallbackResults[0] ||
        {};

      return {
        ...route,
        routeNumber: route.busNumber || mockRoute?.number || "—",
        routeName: mockRoute?.name || route.routeName || `Bus ${route.busNumber || "—"}`,
        stopPath: route.stops?.length
          ? route.stops.join(" → ")
          : (mockRoute?.stopIds || []).map((stopId) => formatStopName(stopId)).join(" → "),
        transferCount: typeof matchingResult.transferCount === "number" ? matchingResult.transferCount : route.isConnection ? 1 : 0,
        travelTimeMin: matchingResult.travelTimeMin ?? mockRoute?.travelTimeMin ?? route.travelTimeMin ?? 0,
        distanceKm: matchingResult.distanceKm ?? mockRoute?.distanceKm ?? 0,
        stopsCount: matchingResult.stopsCount ?? route.stops?.length ?? 0,
        fare: matchingResult.fare ?? mockRoute?.fare ?? 0,
        nextDepartures: matchingResult.nextDepartures?.length ? matchingResult.nextDepartures : ["Now"],
      };
    });
  }, [routes, fallbackResults, mockResults]);

  const handleEditSearch = () => {
    const searchCard = document.querySelector(".search-card");
    if (searchCard) {
      searchCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="results-shell fade-up">
      <div className="results-summary">
        <div className="results-summary__left">
          <div className="results-summary__route">{sourceName} → {destinationName}</div>
          <div className="results-summary__meta">LEAVING NOW · {mergedRoutes.length} BUSES FOUND</div>
        </div>

        <button className="results-summary__action" type="button" onClick={handleEditSearch}>
          Edit search
        </button>
      </div>

      <div className="results-list">
        {mergedRoutes.map((route, index) => (
            <article key={`${route.routeNumber}-${index}`} className="results-card">
              <div className="results-card__main">
                <div className="results-card__route">
                  <div className="results-card__badge">{route.routeNumber}</div>

                  <div className="results-card__copy">
                    <h3>{route.routeName}</h3>
                    <p>{route.stopPath}</p>
                  </div>
                </div>

              </div>

              <div className="results-card__stats">
                <div className="results-card__stat">
                  <span>Travel time</span>
                  <strong>{route.travelTimeMin} min</strong>
                </div>
                <div className="results-card__stat">
                  <span>Distance</span>
                  <strong>{route.distanceKm.toFixed(1)} km</strong>
                </div>
                <div className="results-card__stat">
                  <span>Stops</span>
                  <strong>{route.stopsCount}</strong>
                </div>
              </div>

              <button
                type="button"
                className="results-card__button"
                onClick={() => onViewFullRoute(route)}
              >
                View route →
              </button>
            </article>
        ))}
      </div>
    </section>
  );
}
