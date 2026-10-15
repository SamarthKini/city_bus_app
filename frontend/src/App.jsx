// import { useState } from "react";
// import "./App.css";
// import Home from "./pages/Home";
// import Results from "./pages/Results";
// import RouteDetail from "./pages/RouteDetail";
// import LiveTracking from "./pages/LiveTracking";

// export default function App() {
//   const [currentView, setCurrentView] = useState("home");
//   const [selectedRouteId, setSelectedRouteId] = useState("rt_45");
//   const [sourceStopId, setSourceStopId] = useState(null);
//   const [destinationStopId, setDestinationStopId] = useState(null);

//   if (currentView === "results") {
//     return (
//       <Results
//         currentView={currentView}
//         setCurrentView={setCurrentView}
//         setSelectedRouteId={setSelectedRouteId}
//         sourceStopId={sourceStopId}
//         destinationStopId={destinationStopId}
//       />
//     );
//   }

//   if (currentView === "detail") {
//     return (
//       <RouteDetail
//         currentView={currentView}
//         selectedRouteId={selectedRouteId}
//         sourceStopId={sourceStopId}
//         destinationStopId={destinationStopId}
//         setCurrentView={setCurrentView}
//         setSelectedRouteId={setSelectedRouteId}
//       />
//     );
//   }

//   if (currentView === "live") {
//     return (
//       <LiveTracking
//         currentView={currentView}
//         selectedRouteId={selectedRouteId}
//         setCurrentView={setCurrentView}
//       />
//     );
//   }

//   return (
//     <Home
//       currentView={currentView}
//       setCurrentView={setCurrentView}
//       onJourneySearch={(sourceId, destinationId) => {
//         setSourceStopId(sourceId);
//         setDestinationStopId(destinationId);
//       }}
//     />
//   );
// }
import { useEffect, useRef, useState } from "react";
import "./App.css";

import Home from "./pages/Home";
import RouteDetail from "./pages/RouteDetail";
import LiveTracking from "./pages/LiveTracking";
import { extractRouteSegment } from "./utils/routeData";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const resultsScrollYRef = useRef(0);

  // This stores the REAL route returned by Django
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedOriginStopId, setSelectedOriginStopId] = useState(null);
  const [selectedDestinationStopId, setSelectedDestinationStopId] = useState(null);

  useEffect(() => {
    const historyKey = "nammaMangaluruView";
    window.history.replaceState({ ...window.history.state, [historyKey]: "home" }, "");
    const handlePopState = (event) => {
      const nextView = event.state?.[historyKey] || "home";
      setCurrentView(nextView);
      if (nextView === "home") {
        window.requestAnimationFrame(() => window.scrollTo(0, resultsScrollYRef.current));
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const backToResults = () => {
    if (window.history.state?.nammaMangaluruView === "detail") {
      window.history.back();
      return;
    }
    setCurrentView("home");
    window.history.replaceState({ ...window.history.state, nammaMangaluruView: "home" }, "");
    window.requestAnimationFrame(() => window.scrollTo(0, resultsScrollYRef.current));
  };

  const navigateToView = (view) => {
    if (view === "home" && currentView === "detail") {
      backToResults();
      return;
    }
    if (view === "detail" && currentView === "live" && window.history.state?.nammaMangaluruView === "live") {
      window.history.back();
      return;
    }
    if ((view === "live" && currentView === "detail") || view === "detail") {
      window.history.pushState({ ...window.history.state, nammaMangaluruView: view }, "");
    } else {
      window.history.replaceState({ ...window.history.state, nammaMangaluruView: view }, "");
    }
    setCurrentView(view);
  };

  const handleViewRoute = (route) => {
    console.log("SELECTED REAL ROUTE:", route);

    setSelectedRoute(route);
    setSelectedOriginStopId(route.originStopId ?? route.stopIds?.[0] ?? null);
    setSelectedDestinationStopId(route.destinationStopId ?? route.stopIds?.at(-1) ?? null);
    resultsScrollYRef.current = window.scrollY;
    window.history.pushState({ ...window.history.state, nammaMangaluruView: "detail" }, "");
    setCurrentView("detail");
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const handleJourneySearch = (originStopId, destinationStopId) => {
    setSelectedOriginStopId(originStopId);
    setSelectedDestinationStopId(destinationStopId);
  };

  const handleDestinationChange = (destinationStopId) => {
    const journey = extractRouteSegment(selectedRoute, selectedOriginStopId, destinationStopId);
    if (!journey) return;
    setSelectedRoute(journey);
    setSelectedDestinationStopId(destinationStopId);
  };

  return (
    <>
      <div style={{ display: currentView === "home" ? "contents" : "none" }}>
        <Home currentView="home" setCurrentView={navigateToView} onViewRoute={handleViewRoute} onJourneySearch={handleJourneySearch} />
      </div>
      {currentView === "detail" && <RouteDetail currentView={currentView} setCurrentView={navigateToView} route={selectedRoute} onBackToResults={backToResults} />}
      {currentView === "live" && <LiveTracking currentView={currentView} setCurrentView={navigateToView} route={selectedRoute} destinationStopId={selectedDestinationStopId} onDestinationChange={handleDestinationChange} />}
    </>
  );
}
