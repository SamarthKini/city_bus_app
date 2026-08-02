// import { ArrowRight, BusFront } from "lucide-react";
// import StatsCards from "./StatsCards";

// export default function RouteCard({ route, onStartJourney, onViewFullRoute }) {
//   const busNumbers = route.segments.map((segment) => segment.busNumber).join(" + ");

//   return (
//     <article className="route-card surface-card fade-up">
//       <div className="route-card__summary">
//         <div className="bus-number">
//           <BusFront size={23} />
//           <strong>{busNumbers}</strong>
//         </div>
//         <span className={route.isConnection ? "route-type route-type--transfer" : "route-type"}>
//           {route.isConnection ? "1 transfer" : "Direct route"}
//         </span>
//         <div className="route-card__title">
//           <p className="eyebrow">Route name</p>
//           <h2>{route.routeName}</h2>
//         </div>
//       </div>

//       <div className="route-path">
//         <div className="route-path__stop">
//           <span className="route-path__label">Source</span>
//           <strong>{route.source}</strong>
//         </div>
//         <ArrowRight size={21} />
//         <div className="route-path__stop">
//           <span className="route-path__label">Destination</span>
//           <strong>{route.destination}</strong>
//         </div>
//       </div>

//       {route.transferStop && (
//         <p className="transfer-note">Change buses at {route.transferStop}</p>
//       )}

//       <StatsCards stopsCount={route.stops.length} />

//       <div className="route-card__actions">
//         <button
//           className="primary-button"
//           type="button"
//           onClick={() => onStartJourney(route)}
//         >
//           Start journey
//         </button>
//         <button
//           className="secondary-button"
//           type="button"
//           onClick={() => onViewFullRoute(route)}
//         >
//           View full route
//         </button>
//       </div>
//     </article>
//   );
// }
import { ArrowRight, BusFront } from "lucide-react";
import StatsCards from "./StatsCards";

export default function RouteCard({ route, onStartJourney, onViewFullRoute }) {
  const busNumbers = route.segments.map((segment) => segment.busNumber).join(" + ");

  return (
    <article className="route-card surface-card fade-up">
      <div className="route-card__summary">
        <div className="bus-number">
          <BusFront size={23} />
          <strong>{busNumbers}</strong>
        </div>
        <span className={route.isConnection ? "route-type route-type--transfer" : "route-type"}>
          {route.isConnection ? "1 transfer" : "Direct route"}
        </span>
        <div className="route-card__title">
          <p className="eyebrow">Route name</p>
          <h2>{route.routeName}</h2>
        </div>
      </div>

      <div className="route-path">
        <div className="route-path__stop">
          <span className="route-path__label">Source</span>
          <strong>{route.source}</strong>
        </div>
        <ArrowRight size={21} />
        <div className="route-path__stop">
          <span className="route-path__label">Destination</span>
          <strong>{route.destination}</strong>
        </div>
      </div>

      {route.transferStop && (
        <p className="transfer-note">Change buses at {route.transferStop}</p>
      )}

      <StatsCards stopsCount={route.stops.length} />

      <div className="route-card__actions">
        <button
          className="primary-button"
          type="button"
          onClick={() => onStartJourney(route)}
        >
          Start journey
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onViewFullRoute(route)}
        >
          View full route
        </button>
      </div>
    </article>
  );
}
