import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const BusIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ArrowIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className="cbrf-arrow-icon">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ClockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const RouteIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5c1.4 0 2.5-1.1 2.5-2.5v-7A2.5 2.5 0 0 0 17.5 7H15" />
    <circle cx="6" cy="5" r="3" />
    <path d="M9 5h1" />
  </svg>
);

const MapPinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const NavIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

const WarnIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const StopsIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── Map Component ─────────────────────────────────────────────────────────────
function RouteMap({ routeData, stops, getStopName }) {
  // Pick intermediate stops to show as markers (max 3 for visual clarity)
  let markerStops = [];
  if (routeData && routeData.direct_routes_available && routeData.direct_routes.length > 0) {
    const allStopIds = routeData.direct_routes[0].stops;
    // Show 3 intermediate stops (skip first and last)
    const inner = allStopIds.slice(1, allStopIds.length - 1);
    const pick  = inner.length <= 3 ? inner : [inner[0], inner[Math.floor(inner.length / 2)], inner[inner.length - 1]];
    markerStops = pick.map((id) => getStopName(id));
  } else if (routeData && !routeData.direct_routes_available && routeData.connection_routes.length > 0) {
    const cr = routeData.connection_routes[0];
    const allIds = cr.routes.flatMap((r) => r.stops);
    const unique = [...new Set(allIds)];
    const inner  = unique.slice(1, unique.length - 1);
    const pick   = inner.length <= 3 ? inner : [inner[0], inner[Math.floor(inner.length / 2)], inner[inner.length - 1]];
    markerStops  = pick.map((id) => getStopName(id));
  }

  // Static positions for up to 3 markers along the diagonal route line
  const markerPositions = [
    { x: "18%",  y: "68%" },  // bottom-left
    { x: "42%",  y: "50%" },  // middle
    { x: "72%",  y: "30%" },  // top-right
  ];

  const hasRoute = markerStops.length > 0;

  return (
    <div className="cbrf-map-card cbrf-card">
      {/* Map background */}
      <div className="cbrf-map-bg" />

      {/* SVG layer: roads + route line */}
      <svg className="cbrf-map-svg" viewBox="0 0 500 480" preserveAspectRatio="xMidYMid slice">
        {/* Parcel blocks */}
        <rect x="340" y="30"  width="110" height="80" rx="6" fill="rgba(200,218,180,0.55)" />
        <rect x="390" y="125" width="80"  height="55" rx="6" fill="rgba(200,218,180,0.45)" />
        <rect x="340" y="290" width="120" height="75" rx="6" fill="rgba(200,218,180,0.45)" />
        <rect x="280" y="380" width="220" height="100" rx="0" fill="rgba(178,210,240,0.55)" />

        {/* Roads — white diagonal strips */}
        <g stroke="white" strokeLinecap="round" opacity="0.85">
          {/* Main diagonal roads */}
          <line x1="-20"  y1="520" x2="320" y2="-20"  strokeWidth="22" />
          <line x1="60"   y1="520" x2="400" y2="-20"  strokeWidth="14" />
          <line x1="160"  y1="520" x2="500" y2="-20"  strokeWidth="18" />
          {/* Dashed center lines */}
          <line x1="-20"  y1="520" x2="320" y2="-20"  strokeWidth="2"  stroke="#ccd9e8" strokeDasharray="18 14" />
          <line x1="60"   y1="520" x2="400" y2="-20"  strokeWidth="2"  stroke="#ccd9e8" strokeDasharray="18 14" />
          <line x1="160"  y1="520" x2="500" y2="-20"  strokeWidth="2"  stroke="#ccd9e8" strokeDasharray="18 14" />
        </g>

        {/* Route line (shown only when route data available) */}
        {hasRoute && (
          <>
            {/* Route glow */}
            <line
              x1="90"  y1={480 * 0.72}
              x2={500} y2={480 * 0.22}
              stroke="#93c5fd" strokeWidth="10" strokeLinecap="round" opacity="0.5"
            />
            {/* Route line */}
            <line
              x1="90"  y1={480 * 0.72}
              x2={500} y2={480 * 0.22}
              stroke="#2563eb" strokeWidth="5" strokeLinecap="round"
            />
          </>
        )}

        {/* Dots: grey ambient dots */}
        {!hasRoute && (
          <>
            <circle cx="280" cy="340" r="5" fill="rgba(100,116,139,0.35)" />
            <circle cx="150" cy="430" r="5" fill="rgba(100,116,139,0.35)" />
          </>
        )}
      </svg>

      {/* Route preview badge */}
      <div className="cbrf-map-badge">
        <MapPinIcon size={15} />
        Route preview
      </div>

      {/* Stop markers */}
      {hasRoute && markerStops.map((name, i) => {
        const pos = markerPositions[i] || markerPositions[markerPositions.length - 1];
        return (
          <div key={i} className="cbrf-map-stop" style={{ left: pos.x, top: pos.y }}>
            <div className="cbrf-map-dot" />
            <div className="cbrf-map-label">{name}</div>
          </div>
        );
      })}

      {/* Zoom controls */}
      <div className="cbrf-zoom">
        <button className="cbrf-zoom-btn">+</button>
        <button className="cbrf-zoom-btn">−</button>
      </div>
    </div>
  );
}

// ─── Direct Route Card ─────────────────────────────────────────────────────────
function DirectRouteCard({ route, getStopName }) {
  const src  = getStopName(route.stops[0]);
  const dest = getStopName(route.stops[route.stops.length - 1]);
  const between = route.stops.slice(1, route.stops.length - 1);

  return (
    <>
      {/* Route info card */}
      <div className="cbrf-card cbrf-route-card cbrf-fadeup cbrf-fadeup-d1">
        {/* Bus number */}
        <div className="cbrf-bus-row">
          <div className="cbrf-bus-badge">
            <span className="cbrf-bus-number">{route.bus_number}</span>
          </div>
          <div>
            <p className="cbrf-bus-label">Bus Number</p>
            <p className="cbrf-bus-title">Route {route.bus_number} · City Express</p>
          </div>
        </div>

        {/* Route */}
        <span className="cbrf-section-label">ROUTE</span>
        <div className="cbrf-route-row">
          <span className="cbrf-pill-blue">{src}</span>
          <ArrowIcon />
          <span className="cbrf-pill-green">{dest}</span>
        </div>

        {/* Stops in between */}
        {between.length > 0 && (
          <>
            <span className="cbrf-section-label">STOPS IN BETWEEN</span>
            <div className="cbrf-stops-row-pills">
              {between.map((stopId, idx) => (
                <span key={stopId}>
                  <span className="cbrf-pill-grey">{getStopName(stopId)}</span>
                  {idx < between.length - 1 && (
                    <ArrowIcon size={13} />
                  )}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats row */}
      <div className="cbrf-stats-row cbrf-fadeup cbrf-fadeup-d2">
        <div className="cbrf-card cbrf-stat-card">
          <div className="cbrf-stat-header">
            <ClockIcon size={17} />
            <span className="cbrf-stat-label">Travel Time</span>
          </div>
          <div className="cbrf-stat-value">30 min</div>
        </div>
        <div className="cbrf-card cbrf-stat-card">
          <div className="cbrf-stat-header">
            <RouteIcon size={17} />
            <span className="cbrf-stat-label">Distance</span>
          </div>
          <div className="cbrf-stat-value">9.0 km</div>
        </div>
        <div className="cbrf-card cbrf-stat-card">
          <div className="cbrf-stat-header">
            <StopsIcon size={17} />
            <span className="cbrf-stat-label">Stops</span>
          </div>
          <div className="cbrf-stat-value">{route.stops.length}</div>
        </div>
      </div>
    </>
  );
}

// ─── Connection Route Card ─────────────────────────────────────────────────────
function ConnectionRouteCard({ connectionRoute, getStopName }) {
  const allStopIds = connectionRoute.routes.flatMap((r) => r.stops);
  const unique     = [...new Set(allStopIds)];
  const src        = getStopName(unique[0]);
  const dest       = getStopName(unique[unique.length - 1]);
  const between    = unique.slice(1, unique.length - 1);

  return (
    <>
      <div className="cbrf-card cbrf-route-card cbrf-fadeup cbrf-fadeup-d1">
        {/* Bus badges */}
        <div className="cbrf-bus-row">
          <div className="cbrf-bus-badge-amber">
            <span className="cbrf-bus-number" style={{ color: "#d97706" }}>
              {connectionRoute.routes.map((r) => r.bus_number).join("+")}
            </span>
          </div>
          <div>
            <p className="cbrf-bus-label">Connection Route</p>
            <p className="cbrf-bus-title">
              {connectionRoute.routes.map((r) => `Bus ${r.bus_number}`).join(" → ")}
            </p>
          </div>
        </div>

        {/* Transfer warning */}
        <div className="cbrf-transfer-banner">
          <WarnIcon size={15} />
          This route requires {connectionRoute.transfer_stops.length} bus change(s)
        </div>

        {/* Route */}
        <span className="cbrf-section-label">ROUTE</span>
        <div className="cbrf-route-row">
          <span className="cbrf-pill-blue">{src}</span>
          <ArrowIcon />
          <span className="cbrf-pill-green">{dest}</span>
        </div>

        {/* Stops in between */}
        {between.length > 0 && (
          <>
            <span className="cbrf-section-label">STOPS IN BETWEEN</span>
            <div className="cbrf-stops-row-pills">
              {between.map((stopId, idx) => (
                <span key={stopId} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span className={
                    connectionRoute.transfer_stops.includes(stopId)
                      ? "cbrf-pill-amber"
                      : "cbrf-pill-grey"
                  }>
                    {getStopName(stopId)}
                  </span>
                  {idx < between.length - 1 && <ArrowIcon size={13} />}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="cbrf-stats-row cbrf-fadeup cbrf-fadeup-d2">
        <div className="cbrf-card cbrf-stat-card">
          <div className="cbrf-stat-header">
            <ClockIcon size={17} />
            <span className="cbrf-stat-label">Travel Time</span>
          </div>
          <div className="cbrf-stat-value">30 min</div>
        </div>
        <div className="cbrf-card cbrf-stat-card">
          <div className="cbrf-stat-header">
            <RouteIcon size={17} />
            <span className="cbrf-stat-label">Distance</span>
          </div>
          <div className="cbrf-stat-value">9.0 km</div>
        </div>
        <div className="cbrf-card cbrf-stat-card">
          <div className="cbrf-stat-header">
            <StopsIcon size={17} />
            <span className="cbrf-stat-label">Stops</span>
          </div>
          <div className="cbrf-stat-value">{unique.length}</div>
        </div>
      </div>
    </>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [stops,           setStops]           = useState([]);
  const [sourceStop,      setSourceStop]      = useState("");
  const [destinationStop, setDestinationStop] = useState("");
  const [routeData,       setRouteData]       = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");

  useEffect(() => { fetchStops(); }, []);

  async function fetchStops() {
    try {
      const res = await axios.get(`${API}/stops/`);
      setStops(res.data);
    } catch (e) {
      console.error("Error fetching stops:", e);
    }
  }

  async function handleSearch() {
    if (!sourceStop || !destinationStop) {
      setError("Please select both source and destination stops.");
      return;
    }
    if (sourceStop === destinationStop) {
      setError("Source and destination cannot be the same stop.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/connections/?from_stop=${sourceStop}&to_stop=${destinationStop}`
      );
      setRouteData(res.data);
    } catch (e) {
      console.error("Error fetching routes:", e);
      setError("Failed to fetch routes. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function getStopName(stopId) {
    const s = stops.find((s) => s.id === stopId || s.id === Number(stopId));
    return s ? s.name : `Stop ${stopId}`;
  }

  // Decide what to show in the left panel below the search card
  const renderResults = () => {
    if (!routeData) {
      return (
        <div className="cbrf-card cbrf-plan-card cbrf-fadeup">
          <div className="cbrf-plan-icon">
            <NavIcon size={34} />
          </div>
          <p className="cbrf-plan-title">Plan a trip</p>
          <p className="cbrf-plan-sub">
            Choose your stops and tap Search Route to see the journey.
          </p>
        </div>
      );
    }

    if (routeData.direct_routes_available && routeData.direct_routes.length > 0) {
      return routeData.direct_routes.map((route, i) => (
        <DirectRouteCard key={`direct-${route.id ?? i}`} route={route} getStopName={getStopName} />
      ));
    }

    if (routeData.connection_routes && routeData.connection_routes.length > 0) {
      return routeData.connection_routes.map((cr, i) => (
        <ConnectionRouteCard key={`conn-${i}`} connectionRoute={cr} getStopName={getStopName} />
      ));
    }

    return (
      <div className="cbrf-card cbrf-no-route cbrf-fadeup">
        <div className="cbrf-no-route-icon">
          <WarnIcon size={26} />
        </div>
        <p className="cbrf-no-route-title">No routes found</p>
        <p className="cbrf-no-route-sub">
          We couldn't find a route between these two stops. Try a different combination.
        </p>
      </div>
    );
  };

  return (
    <div className="cbrf-root">

      {/* ── Header ── */}
      <header className="cbrf-header">
        <div className="cbrf-header-icon">
          <BusIcon size={26} color="#fff" />
        </div>
        <div>
          <p className="cbrf-header-title">City Bus Route Finder</p>
          <p className="cbrf-header-sub">Plan your journey across the city</p>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="cbrf-body">

        {/* Left panel */}
        <div className="cbrf-left">

          {/* Search card */}
          <div className="cbrf-card cbrf-search-card">
            <div className="cbrf-stops-row">
              <div>
                <label className="cbrf-field-label">Source Stop</label>
                <select
                  className="cbrf-select"
                  value={sourceStop}
                  onChange={(e) => setSourceStop(e.target.value)}
                >
                  <option value="">Select stop</option>
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="cbrf-field-label">Destination Stop</label>
                <select
                  className="cbrf-select"
                  value={destinationStop}
                  onChange={(e) => setDestinationStop(e.target.value)}
                >
                  <option value="">Select stop</option>
                  {stops.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="cbrf-search-btn"
              onClick={handleSearch}
              disabled={loading}
              data-testid="search-btn"
            >
              <SearchIcon size={18} />
              {loading ? "Searching…" : "Search Route"}
            </button>

            {error && (
              <div className="cbrf-error" data-testid="error-message">{error}</div>
            )}
          </div>

          {/* Results / empty state */}
          {renderResults()}
        </div>

        {/* Right panel — map */}
        <div className="cbrf-right">
          <RouteMap routeData={routeData} stops={stops} getStopName={getStopName} />
        </div>

      </main>

      {/* ── Footer ── */}
      <footer className="cbrf-footer">
        © 2026 City Bus Route Finder · Demo data for visualization
      </footer>

    </div>
  );
}
