import Header from "../components/Header";

export default function Results({
  currentView,
  setCurrentView,
  setSelectedRouteId,
  sourceStopId,
  destinationStopId,
  routes = [],
}) {
  const sourceName = sourceStopId || "Source";
  const destinationName = destinationStopId || "Destination";

  return (
    <div className="app-shell">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="results-page">

        <section className="results-summary">
          <div className="results-summary__left">
            <div className="results-summary__route">
              {sourceName} → {destinationName}
            </div>

            <div className="results-summary__meta">
              LEAVING NOW · {routes.length}{" "}
              {routes.length === 1 ? "BUS" : "BUSES"} FOUND
            </div>
          </div>

          <button
            type="button"
            className="results-summary__action"
            onClick={() => setCurrentView("home")}
          >
            Edit search
          </button>
        </section>

        <div className="results-list">

          {routes.length === 0 ? (
            <div className="surface-card">
              <h3>No routes found</h3>
              <p>
                No bus route is available between the selected stops.
              </p>
            </div>
          ) : (
            routes.map((route, index) => (
              <article
                key={`${route.busNumber}-${index}`}
                className="results-card"
              >

                <div className="results-card__main">
                  <div className="results-card__route">

                    <div className="results-card__badge">
                      {route.busNumber || "—"}
                    </div>

                    <div className="results-card__copy">
                      <h3>
                        {route.routeName ||
                          `Bus ${route.busNumber || "—"} city route`}
                      </h3>

                      <p>
                        {route.stops?.length
                          ? route.stops.join(" → ")
                          : "Stops not available"}
                      </p>
                    </div>

                  </div>
                </div>

                <div className="results-card__stats">

                  <div className="results-card__stat">
                    <span>Travel time</span>
                    <strong>
                      {route.travelTimeMin
                        ? `${route.travelTimeMin} min`
                        : "—"}
                    </strong>
                  </div>

                  <div className="results-card__stat">
                    <span>Distance</span>
                    <strong>
                      {typeof route.distanceKm === "number"
                        ? `${route.distanceKm.toFixed(1)} km`
                        : "—"}
                    </strong>
                  </div>

                  <div className="results-card__stat">
                    <span>Stops</span>
                    <strong>
                      {route.stops?.length || "—"}
                    </strong>
                  </div>

                </div>

                <button
                  type="button"
                  className="results-card__button"
                  onClick={() => {
                    setSelectedRouteId(route.id);
                    setCurrentView("detail");
                  }}
                >
                  View route →
                </button>

              </article>
            ))
          )}

        </div>

      </main>
    </div>
  );
}