import { useEffect, useState } from "react";
import Header from "../components/Header";
import ResultsList from "../components/ResultsList";
import SearchCard from "../components/SearchCard";
import { fetchConnections, fetchStops } from "../services/api";
import { buildConnectionRoute, buildDirectRoute } from "../utils/routeData";

export default function Home({ onJourneySearch, onViewRoute, setCurrentView, currentView }) {
  const [stops, setStops] = useState([]);
  const [sourceStop, setSourceStop] = useState("");
  const [destinationStop, setDestinationStop] = useState("");
  const [routes, setRoutes] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStops() {
      try {
        const data = await fetchStops();
        setStops(Array.isArray(data) ? data : []);
      } catch {
        setStops([]);
        setError("Unable to load bus stops. Please make sure the backend is running.");
      }
    }
    loadStops();
  }, []);

  async function handleSearch() {
    if (!sourceStop || !destinationStop) {
      setError("Please select both source and destination stops.");
      return;
    }
    if (String(sourceStop) === String(destinationStop)) {
      setError("Source and destination cannot be the same stop.");
      return;
    }
    setError("");
    setLoading(true);
    setHasSearched(true);
    try {
      const routeData = await fetchConnections(sourceStop, destinationStop);
      const directRoutes = (routeData.direct_routes || []).map((route) => buildDirectRoute(route, stops));
      const connectionRoutes = (routeData.connection_routes || []).map((route) => buildConnectionRoute(route, stops));
      setRoutes([...directRoutes, ...connectionRoutes]);
      onJourneySearch?.(sourceStop, destinationStop);
    } catch {
      setRoutes([]);
      setError("Failed to find buses. Please check the backend.");
    } finally {
      setLoading(false);
    }
  }

  const sourceName = stops.find((stop) => String(stop.id) === String(sourceStop))?.name;
  const destinationName = stops.find((stop) => String(stop.id) === String(destinationStop))?.name;

  return (
    <div className="app-shell">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="home-layout">
        <section className="hero-search"><div className="hero-wrapper">
          <div className="hero-content"><span className="hero-pill">SMART BUS ROUTE FINDER</span><h1>Catch the right bus,<br />every time.</h1><p>Plan a smoother trip with simple route comparisons and live updates for every journey across Mangalore.</p></div>
          <SearchCard destinationStop={destinationStop} error={error} loading={loading} onDestinationChange={setDestinationStop} onSearch={handleSearch} onSourceChange={setSourceStop} sourceStop={sourceStop} stops={stops} />
        </div></section>
        {hasSearched ? <ResultsList routes={routes} sourceStop={sourceName} destinationStop={destinationName} onViewRoute={onViewRoute} /> : (
          <section className="how-section fade-up"><h2>How it works</h2><div className="how-grid">
            <div><span>01</span><h3>Enter your stops</h3><p>Select your boarding and destination stops.</p></div>
            <div><span>02</span><h3>Compare routes</h3><p>View direct and transfer buses with travel options.</p></div>
            <div><span>03</span><h3>Start your journey</h3><p>Pick the best route and begin your trip.</p></div>
          </div></section>
        )}
      </main>
      <footer className="app-footer" />
    </div>
  );
}
