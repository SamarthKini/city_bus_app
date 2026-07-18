import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import FullRouteModal from "../components/FullRouteModal";
import Header from "../components/Header";
import RouteCard from "../components/RouteCard";
import RouteMap from "../components/RouteMap";
import SearchCard from "../components/SearchCard";
import { fetchConnections, fetchStops } from "../services/api";

function getStopName(stopId, stops) {
  const stop = stops.find((item) => item.id === stopId || item.id === Number(stopId));
  return stop ? stop.name : `Stop ${stopId}`;
}

function buildDirectRoute(route, stops) {
  const routeStops = (route.stops || []).map((stopId) => getStopName(stopId, stops));

  return {
    busNumber: route.bus_number,
    destination: routeStops.at(-1) || "Destination",
    isConnection: false,
    routeName: `Bus ${route.bus_number} city route`,
    segments: [{ busNumber: route.bus_number }],
    source: routeStops[0] || "Source",
    stops: routeStops,
  };
}

function buildConnectionRoute(connection, stops) {
  const firstRoute = connection.from_route;
  const secondRoute = connection.to_route;
  const firstStops = (firstRoute?.stops || []).map((stopId) => getStopName(stopId, stops));
  const secondStops = (secondRoute?.stops || []).map((stopId) => getStopName(stopId, stops));
  const allStops = [...new Set([...firstStops, ...secondStops])];
  const transferStop = connection.transfer_stop?.name || "Transfer stop";

  return {
    destination: allStops.at(-1) || "Destination",
    isConnection: true,
    routeName: `Bus ${firstRoute?.bus_number} to Bus ${secondRoute?.bus_number}`,
    segments: [
      { busNumber: firstRoute?.bus_number || "-" },
      { busNumber: secondRoute?.bus_number || "-" },
    ],
    source: allStops[0] || "Source",
    stops: allStops,
    transferStop,
  };
}

export default function Home({ onStartJourney }) {
  const [stops, setStops] = useState([]);
  const [sourceStop, setSourceStop] = useState("");
  const [destinationStop, setDestinationStop] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [modalRoute, setModalRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStops() {
      try {
        const data = await fetchStops();
        setStops(data);
      } catch (requestError) {
        console.error("Error fetching stops:", requestError);
        setError("Unable to load bus stops. Please make sure the API is running.");
      }
    }

    loadStops();
  }, []);

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
      const routeData = await fetchConnections(sourceStop, destinationStop);
      const directRoutes = (routeData.direct_routes || []).map((route) =>
        buildDirectRoute(route, stops)
      );
      const connectionRoutes = (routeData.connection_routes || []).map((route) =>
        buildConnectionRoute(route, stops)
      );
      const availableRoutes = [...directRoutes, ...connectionRoutes];

      setRoutes(availableRoutes);
      setSelectedRoute(availableRoutes[0] || null);
    } catch (requestError) {
      console.error("Error fetching routes:", requestError);
      setError("Failed to fetch routes. Please check your connection and try again.");
      setRoutes([]);
      setSelectedRoute(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="home-layout">
        <div className="home-search-row">
          <SearchCard
            destinationStop={destinationStop}
            error={error}
            loading={loading}
            onDestinationChange={setDestinationStop}
            onSearch={handleSearch}
            onSourceChange={setSourceStop}
            sourceStop={sourceStop}
            stops={stops}
          />

          <aside className="home-layout__map">
          <RouteMap route={selectedRoute} />
          </aside>
        </div>

        {routes.length > 0 ? (
          <section className="route-results">
            <div className="results-heading">
              <div>
                <p className="eyebrow">Recommended route</p>
                <h2>{routes.length} route{routes.length === 1 ? "" : "s"} found for your journey</h2>
              </div>
            </div>

            {routes.map((route, index) => (
              <RouteCard
                key={`${route.routeName}-${index}`}
                route={route}
                onStartJourney={onStartJourney}
                onViewFullRoute={setModalRoute}
              />
            ))}
          </section>
        ) : (
          <section className="empty-state surface-card fade-up">
            <div className="empty-state__icon">
              <Compass size={28} />
            </div>
            <div>
              <h2>Ready when you are</h2>
              <p>Search a source and destination to see the best city bus options.</p>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        City Bus Route Finder · Mangalore public transit
      </footer>

      <FullRouteModal
        route={modalRoute}
        onClose={() => setModalRoute(null)}
      />
    </div>
  );
}
