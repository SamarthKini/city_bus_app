import { X } from "lucide-react";

export default function FullRouteModal({ route, onClose }) {
  if (!route) return null;
  const stops = route.stops || [];
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section aria-modal="true" className="route-modal" role="dialog" aria-labelledby="route-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <div className="route-modal__header">
          <div><p className="eyebrow">Complete route</p><h2 id="route-modal-title">{route.routeName || `Bus ${route.busNumber ?? "—"}`}</h2><p>{route.source ?? "—"} → {route.destination ?? "—"}</p></div>
          <button aria-label="Close full route" className="icon-button" type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="stop-timeline">
          {stops.length === 0 ? <div className="surface-card"><h3>Route stops unavailable</h3><p>The backend did not provide stops for this route.</p></div> : stops.map((stop, index) => {
            const status = index === 0 ? "start" : index === stops.length - 1 ? "destination" : "middle";
            return <div className="timeline-stop" key={`${route.stopIds?.[index] ?? stop}-${index}`}><div className={`timeline-stop__marker timeline-stop__marker--${status}`}><span /></div><div><strong>{stop}</strong><p>{index === 0 ? "Starting stop" : index === stops.length - 1 ? "Destination stop" : "Intermediate stop"}</p></div></div>;
          })}
        </div>
      </section>
    </div>
  );
}
