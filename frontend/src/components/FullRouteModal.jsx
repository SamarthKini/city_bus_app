import { X } from "lucide-react";

export default function FullRouteModal({ route, onClose }) {
  if (!route) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        aria-modal="true"
        className="route-modal"
        role="dialog"
        aria-labelledby="route-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-handle" />
        <div className="route-modal__header">
          <div>
            <p className="eyebrow">Complete route</p>
            <h2 id="route-modal-title">{route.routeName}</h2>
          </div>
          <button
            aria-label="Close full route"
            className="icon-button"
            type="button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="stop-timeline">
          {route.stops.map((stop, index) => {
            const isStart = index === 0;
            const isDestination = index === route.stops.length - 1;
            const status = isStart ? "start" : isDestination ? "destination" : "middle";

            return (
              <div
                className="timeline-stop"
                key={`${stop}-${index}`}
              >
                <div className={`timeline-stop__marker timeline-stop__marker--${status}`}>
                  <span />
                </div>
                <div>
                  <strong>{stop}</strong>
                  <p>
                    {isStart && "Starting stop"}
                    {isDestination && "Destination stop"}
                    {!isStart && !isDestination && "Intermediate stop"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
