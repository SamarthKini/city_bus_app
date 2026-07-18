import { MapPin } from "lucide-react";

export default function RouteMap({ route, compact = false }) {
  const markers = route?.stops?.slice(1, -1).slice(0, 3) || [];

  return (
    <section className={compact ? "route-map route-map--compact" : "route-map surface-card"}>
      <div className="map-grid" />
      <svg
        aria-hidden="true"
        className="map-line"
        viewBox="0 0 600 340"
      >
        <path
          d="M50 280 C150 210, 240 250, 320 150 S470 130, 560 55"
          fill="none"
          stroke="#2563eb"
          strokeLinecap="round"
          strokeWidth="10"
        />
        <path
          d="M50 280 C150 210, 240 250, 320 150 S470 130, 560 55"
          fill="none"
          stroke="#ffffff"
          strokeDasharray="5 12"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>

      <div className="map-label">
        <MapPin size={16} />
        {route ? "Route preview" : "Map preview"}
      </div>

      {route && (
        <>
          <span className="map-marker map-marker--start">{route.source}</span>
          <span className="map-marker map-marker--end">{route.destination}</span>
          {markers.map((stop, index) => (
            <span
              className={`map-marker map-marker--middle map-marker--middle-${index}`}
              key={stop}
            >
              {stop}
            </span>
          ))}
        </>
      )}
    </section>
  );
}
