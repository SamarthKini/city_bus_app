import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import ResultsList from "../components/ResultsList";
import SearchCard from "../components/SearchCard";
import { fetchConnections, fetchRouteStops, fetchStops } from "../services/api";
import { buildJourneyResults } from "../utils/routeData";

export default function Home({ onJourneySearch, onViewRoute, setCurrentView, currentView }) {
  const [stops, setStops] = useState([]);
  const [routeStopRecords, setRouteStopRecords] = useState([]);
  const [sourceStop, setSourceStop] = useState("");
  const [destinationStop, setDestinationStop] = useState("");
  const [routes, setRoutes] = useState([]);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [searchError, setSearchError] = useState("");
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);

  useEffect(() => () => { requestIdRef.current += 1; }, []);

  useEffect(() => {
    async function loadStops() {
      try {
        const [data, routeStopData] = await Promise.all([fetchStops(), fetchRouteStops().catch(() => [])]);
        setStops(Array.isArray(data) ? data : []);
        setRouteStopRecords(Array.isArray(routeStopData) ? routeStopData : []);
      } catch {
        setStops([]);
        setRouteStopRecords([]);
        setError("Unable to load bus stops. Please make sure the backend is running.");
      }
    }
    loadStops();
  }, []);

  async function handleSearch() {
    if (inFlightRef.current) return;
    const requestId = ++requestIdRef.current;
    if (!sourceStop || !destinationStop) {
      setSearchStatus("idle");
      setError("Please select both source and destination stops.");
      return;
    }
    if (String(sourceStop) === String(destinationStop)) {
      setSearchStatus("idle");
      setError("Source and destination cannot be the same stop.");
      return;
    }
    setError("");
    setSearchError("");
    setRoutes([]);
    setSearchStatus("loading");
    inFlightRef.current = true;
    try {
      const routeData = await fetchConnections(sourceStop, destinationStop);
      const matchingRoutes = buildJourneyResults(routeData, stops, routeStopRecords, sourceStop, destinationStop);
      if (requestId !== requestIdRef.current) return;
      setRoutes(matchingRoutes);
      setSearchStatus("success");
      onJourneySearch?.(sourceStop, destinationStop);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setRoutes([]);
      setSearchError("Failed to find buses. Please check your connection and try again.");
      setSearchStatus("error");
    } finally {
      if (requestId === requestIdRef.current) inFlightRef.current = false;
    }
  }

  function handleStopChange(setter, value) {
    requestIdRef.current += 1;
    inFlightRef.current = false;
    setter(value);
    setRoutes([]);
    setSearchStatus("idle");
    setSearchError("");
    setError("");
  }

  function retrySearch() {
    handleSearch();
  }

  function focusStopSelection() {
    const sourceSelect = document.getElementById("source-stop-select");
    sourceSelect?.scrollIntoView({ behavior: "smooth", block: "center" });
    sourceSelect?.focus();
  }

  const sourceName = stops.find((stop) => String(stop.id) === String(sourceStop))?.name;
  const destinationName = stops.find((stop) => String(stop.id) === String(destinationStop))?.name;

  return (
    <div className="app-shell">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="home-layout">
        <section className="hero-search"><div className="hero-wrapper">
          <div className="hero-content">
            <span className="hero-route-decoration" aria-hidden="true">
              <span className="hero-route-decoration__path" />
              <span className="hero-route-decoration__pin" />
            </span>
            <span className="hero-pill">SMART BUS ROUTE FINDER</span>
            <h1>Catch the right bus,<br /><span className="hero-highlight">every time.</span></h1>
            <p>Plan a smoother trip with simple route comparisons and live updates for every journey across Mangalore.</p>
          </div>
          <SearchCard destinationStop={destinationStop} error={error} loading={searchStatus === "loading"} onDestinationChange={(value) => handleStopChange(setDestinationStop, value)} onSearch={handleSearch} onSourceChange={(value) => handleStopChange(setSourceStop, value)} sourceStop={sourceStop} stops={stops} />
        </div></section>
        {searchStatus !== "idle" ? <ResultsList routes={routes} sourceStop={sourceName} destinationStop={destinationName} status={searchStatus} error={searchError} onRetry={retrySearch} onChangeStops={focusStopSelection} onViewRoute={onViewRoute} /> : (
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
