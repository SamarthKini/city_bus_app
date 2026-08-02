import Header from "../components/Header";
import { getRouteById, getStopById, routeDetailByRouteId } from "../mockdata";
import { buildGoogleMapsRouteUrl } from "../utils/mapsLink";

function getJourneyStopSlice(stops, sourceStopId, destinationStopId) {
  if (!sourceStopId || !destinationStopId) return [];

  const sourceIndex = stops.findIndex((stop) => String(stop.stopId) === String(sourceStopId));
  const destinationIndex = stops.findIndex((stop) => String(stop.stopId) === String(destinationStopId));

  if (sourceIndex < 0 || destinationIndex < 0) return [];

  return sourceIndex <= destinationIndex
    ? stops.slice(sourceIndex, destinationIndex + 1)
    : stops.slice(destinationIndex, sourceIndex + 1).reverse();
}

export default function RouteDetail({ currentView, destinationStopId, selectedRouteId, setCurrentView, sourceStopId }) {
  const route = getRouteById(selectedRouteId) || routeDetailByRouteId[0];
  const detail = routeDetailByRouteId[selectedRouteId] || routeDetailByRouteId[route.id];
  const fullRouteStops = detail?.stops || [];
  const slicedJourneyStops = getJourneyStopSlice(fullRouteStops, sourceStopId, destinationStopId);
  const isJourneySlice = slicedJourneyStops.length > 0;
  const journeyStops = isJourneySlice ? slicedJourneyStops : fullRouteStops;
  const journeyStopObjects = journeyStops.map((stop) => getStopById(stop.stopId)).filter(Boolean);
  const googleMapsRouteUrl = buildGoogleMapsRouteUrl(journeyStopObjects);
  const sourceName = journeyStops[0]?.name || "Selected origin";
  const destinationName = journeyStops.at(-1)?.name || "Selected destination";
  const routeSummary = journeyStops.length
    ? `${sourceName} → ${destinationName} · ${journeyStops.length} stop${journeyStops.length === 1 ? "" : "s"} · ${isJourneySlice ? "Direct route" : "Full route"}`
    : "Journey stops are unavailable for this route.";

  const openGoogleMaps = () => googleMapsRouteUrl && window.open(googleMapsRouteUrl, "_blank", "noopener,noreferrer");

  return (
    <div className="app-shell">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="route-detail-page">
        <div className="route-detail-layout">
          <section className="detail-card route-detail-card">
            <div className="detail-card__header">
              <div>
                <div className="detail-kicker">Route details</div>
                <h1>{route?.name || detail?.name}</h1>
                <p>{routeSummary}</p>
              </div>
              <div className="detail-actions">
                <button type="button" className="detail-button detail-button--secondary" onClick={() => setCurrentView("results")}>Back to results</button>
                <button type="button" className="detail-button detail-button--primary" onClick={() => setCurrentView("live")}>Start journey</button>
                <button type="button" className="detail-button detail-button--map" onClick={openGoogleMaps} disabled={!googleMapsRouteUrl}>
                  {googleMapsRouteUrl ? "Open in Google Maps" : "Map unavailable"}
                </button>
              </div>
            </div>
          </section>

          <section className="detail-card route-stops-card">
            <div className="detail-card__header route-stops-card__header">
              <h2>{isJourneySlice ? "Stops along your journey" : "Stops along the route"}</h2>
              <button type="button" className="detail-button detail-button--map" onClick={openGoogleMaps} disabled={!googleMapsRouteUrl}>View on Map</button>
            </div>

            <ol className="route-stop-list">
              {journeyStops.map((stop, index) => {
                const isOrigin = index === 0;
                const isDestination = index === journeyStops.length - 1;
                const stateClass = isOrigin || isDestination ? " route-stop--endpoint" : "";

                return (
                  <li key={stop.stopId} className={`route-stop${stateClass}${isDestination ? " route-stop--destination" : ""}`}>
                    <span className="route-stop__number">{index + 1}</span>
                    <span className="route-stop__marker" aria-hidden="true" />
                    <div className="route-stop__content">
                      <strong>{stop.name}</strong>
                      {isOrigin && <span className="route-stop__hint">(Origin)</span>}
                      {isDestination && <span className="route-stop__destination-label">Your Destination</span>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
