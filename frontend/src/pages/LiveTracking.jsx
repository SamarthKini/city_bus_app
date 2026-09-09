import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import Header from "../components/Header";
import useLocation from "../hooks/useLocation";
import { findNearestStop } from "../services/api";
import { buildGoogleMapsRouteUrl } from "../utils/mapsLink";

export default function LiveTracking({ currentView, route, setCurrentView }) {
  const location = useLocation();
  const [nearestStop, setNearestStop] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const routeNumber = route?.isConnection ? null : route?.busNumber ?? route?.routeNumber;
  const mapUrl = buildGoogleMapsRouteUrl(route?.stopObjects || []);

  useEffect(() => {
    if (!routeNumber || location.latitude === null || location.longitude === null) return;
    async function loadNearestStop() {
      try {
        setTrackingError("");
        setNearestStop(await findNearestStop(routeNumber, location.latitude, location.longitude));
      } catch {
        setNearestStop(null);
        setTrackingError("Live tracking unavailable for this route.");
      }
    }
    loadNearestStop();
  }, [location.latitude, location.longitude, routeNumber]);

  if (!route) {
    return <div className="app-shell"><Header currentView={currentView} setCurrentView={setCurrentView} /><main className="route-detail-page"><section className="detail-card"><h1>Live tracking unavailable</h1><p>Select a route before starting live tracking.</p><button type="button" className="detail-button detail-button--secondary" onClick={() => setCurrentView("home")}>Back to search</button></section></main></div>;
  }

  const unavailable = !routeNumber;
  return (
    <div className="app-shell"><Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="route-detail-page"><section className="detail-card route-detail-card"><div className="detail-card__header"><div>
        <div className="detail-kicker">Live tracking</div><h1>{route.routeName || `Bus ${route.busNumber ?? "—"}`}</h1>
        <p>{unavailable ? "Live tracking unavailable for transfer routes." : nearestStop ? `Nearest stop: ${nearestStop.name}` : trackingError || "Waiting for your location and live bus data."}</p>
        {nearestStop?.distance_meters != null && <p>{Math.round(nearestStop.distance_meters)} m away</p>}
      </div><div className="detail-actions"><button type="button" className="detail-button detail-button--secondary" onClick={() => setCurrentView("detail")}>Back to route</button><button type="button" className="detail-button detail-button--map" disabled={!mapUrl} onClick={() => mapUrl && window.open(mapUrl, "_blank", "noopener,noreferrer")}><MapPin size={16} /> {mapUrl ? "View on Map" : "Map unavailable"}</button></div></div></section>
      <section className="detail-card route-stops-card"><h2>Route stops</h2><ol className="route-stop-list">{(route.stops || []).map((stop, index) => <li key={`${route.stopIds?.[index] ?? stop}-${index}`} className="route-stop"><span className="route-stop__number">{index + 1}</span><span className="route-stop__marker" /><div className="route-stop__content"><strong>{stop}</strong></div></li>)}</ol></section></main>
    </div>
  );
}
