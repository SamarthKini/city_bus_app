import { useEffect, useState } from "react";
import FullRouteModal from "../components/FullRouteModal";
import Header from "../components/Header";
import ResultsList from "../components/ResultsList";
import SearchCard from "../components/SearchCard";
import { fetchConnections, fetchStops } from "../services/api";
import { stops as mockStops, getSearchResults } from '../mockdata';
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

export default function Home({ onStartJourney, onJourneySearch, setCurrentView, currentView }) {
  const [stops, setStops] = useState([]);
  const [sourceStop, setSourceStop] = useState("");
  const [destinationStop, setDestinationStop] = useState("");
  const [routes, setRoutes] = useState([]);
  // const [selectedRoute, setSelectedRoute] = useState(null);
  const [modalRoute, setModalRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   async function loadStops() {
  //     try {
  //       const data = await fetchStops();
  //       setStops(data);
  //     } catch (requestError) {
  //       console.error("Error fetching stops:", requestError);
  //       setError("Unable to load bus stops. Please make sure the API is running.");
  //     }
  //   }

  //   loadStops();
  // }, []);
  useEffect(() => {
  async function loadStops() {
    try {
      const data = await fetchStops();
      setStops(data.length > 0 ? data : mockStops);
    } catch (requestError) {
      console.error("Error fetching stops:", requestError);
      setStops(mockStops); // fall back to mock data instead of leaving it empty
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
      onJourneySearch?.(sourceStop, destinationStop);
      setCurrentView("results");
      // setSelectedRoute(availableRoutes[0] || null);
    } catch (requestError) {
      // TEMPORARY — remove this fallback once the backend DB is seeded.
      // Real behavior should be: show the error above instead.
      console.warn("API unavailable, using mock data:", requestError);
      const mockResults = getSearchResults(sourceStop, destinationStop);
      setRoutes(mockResults);
      onJourneySearch?.(sourceStop, destinationStop);
      setCurrentView("results");
      setError("");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="app-shell">
    <Header currentView={currentView} setCurrentView={setCurrentView} />

    <main className="home-layout">
      <section className="hero-search">
        <div className="hero-wrapper">
          <div className="hero-content">
            <span className="hero-pill">SMART BUS ROUTE FINDER</span>

            <h1>
              Catch the right bus,
              <br />
              every time.
            </h1>

            <p>
              Plan a smoother trip with simple route comparisons and live
              updates for every journey across Mangalore.
            </p>

          </div>

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
        </div>
      </section>

      {/* Results */}

{/* Results */}

{routes.length > 0 ? (

  <ResultsList
    routes={routes}
    sourceStop={sourceStop}
    destinationStop={destinationStop}
    onViewFullRoute={setModalRoute}
  />

) : (

  <>
    <section className="how-section fade-up">

      <h2>How it works</h2>

      <div className="how-grid">

        <div>
          <span>01</span>
          <h3>Enter your stops</h3>
          <p>Select your boarding and destination stops.</p>
        </div>

        <div>
          <span>02</span>
          <h3>Compare routes</h3>
          <p>View direct and transfer buses with travel options.</p>
        </div>

        <div>
          <span>03</span>
          <h3>Start your journey</h3>
          <p>Pick the best route and begin your trip.</p>
        </div>

      </div>

    </section>
  </>

)}
    </main>

    <footer className="app-footer" />

    <FullRouteModal
      route={modalRoute}
      onClose={() => setModalRoute(null)}
    />

  </div>
);
}
