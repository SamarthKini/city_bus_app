import { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import Results from "./pages/Results";
import RouteDetail from "./pages/RouteDetail";
import LiveTracking from "./pages/LiveTracking";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedRouteId, setSelectedRouteId] = useState("rt_45");
  const [sourceStopId, setSourceStopId] = useState(null);
  const [destinationStopId, setDestinationStopId] = useState(null);

  if (currentView === "results") {
    return (
      <Results
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSelectedRouteId={setSelectedRouteId}
        sourceStopId={sourceStopId}
        destinationStopId={destinationStopId}
      />
    );
  }

  if (currentView === "detail") {
    return (
      <RouteDetail
        currentView={currentView}
        selectedRouteId={selectedRouteId}
        sourceStopId={sourceStopId}
        destinationStopId={destinationStopId}
        setCurrentView={setCurrentView}
        setSelectedRouteId={setSelectedRouteId}
      />
    );
  }

  if (currentView === "live") {
    return (
      <LiveTracking
        currentView={currentView}
        selectedRouteId={selectedRouteId}
        setCurrentView={setCurrentView}
      />
    );
  }

  return (
    <Home
      currentView={currentView}
      setCurrentView={setCurrentView}
      onJourneySearch={(sourceId, destinationId) => {
        setSourceStopId(sourceId);
        setDestinationStopId(destinationId);
      }}
    />
  );
}
