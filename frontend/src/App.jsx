import { useEffect, useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import Journey from "./pages/Journey";

function getCurrentPage() {
  return window.location.hash === "#/journey" ? "journey" : "home";
}

export default function App() {
  const [page, setPage] = useState(getCurrentPage);
  const [journey, setJourney] = useState(null);

  useEffect(() => {
    function handleHashChange() {
      setPage(getCurrentPage());
    }

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  function startJourney(route) {
    setJourney(route);
    window.location.hash = "/journey";
  }

  function returnHome() {
    window.location.hash = "/";
  }

  if (page === "journey") {
    return (
      <Journey
        journey={journey}
        onBack={returnHome}
      />
    );
  }

  return <Home onStartJourney={startJourney} />;
}
