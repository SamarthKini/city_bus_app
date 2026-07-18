import { useState } from "react";
import { BusFront, MapPin, Navigation, X } from "lucide-react";
import AlarmCard from "../components/AlarmCard";
import Header from "../components/Header";
import RouteMap from "../components/RouteMap";
import useLocation from "../hooks/useLocation";

export default function Journey({ journey, onBack }) {
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const location = useLocation();
  const stops = journey?.stops || ["Starting stop", "Current stop", "Destination stop"];
  const currentStop = stops[Math.min(1, stops.length - 1)];
  const nextStop = stops[Math.min(2, stops.length - 1)];
  const afterNextStop = stops[Math.min(3, stops.length - 1)];
  const distanceRemaining = 180;

  return (
    <div className="app-shell">
      <Header
        journeyMode
        onBack={onBack}
      />
      <main className="journey-page">
        <div className="journey-page__intro">
          <span className="journey-active">● Journey active</span>
          <h1>{journey?.routeName || "Your city bus journey"}</h1>
          <p>Follow your bus and get notified as you approach your destination.</p>
        </div>

        <RouteMap
          compact
          route={journey}
        />

        <section className="journey-progress surface-card">
          <div className="journey-progress__heading">
            <div>
              <p className="eyebrow">Journey progress</p>
              <h2>On the way to {journey?.destination || "your destination"}</h2>
            </div>
            <span>45%</span>
          </div>
          <div className="progress-track">
            <span className="progress-track__fill" />
            <span className="progress-track__start">●</span>
            <span className="progress-track__bus">
              <BusFront size={19} />
            </span>
            <span className="progress-track__end">○</span>
          </div>
          <div className="progress-labels">
            <span>{journey?.source || "Start"}</span>
            <span>{journey?.destination || "Destination"}</span>
          </div>
        </section>

        <div className="journey-grid">
          <section className="journey-info-card surface-card">
            <MapPin size={20} />
            <p className="eyebrow">Current stop</p>
            <h2>{currentStop}</h2>
          </section>
          <section className="journey-info-card surface-card">
            <Navigation size={20} />
            <p className="eyebrow">After next stop</p>
            <h2>{afterNextStop}</h2>
          </section>
          <section className="journey-info-card surface-card">
            <Navigation size={20} />
            <p className="eyebrow">Next stop</p>
            <h2>{nextStop}</h2>
          </section>
          <section className="journey-info-card surface-card">
            <p className="eyebrow">Distance remaining</p>
            <h2>{distanceRemaining} m</h2>
            <span>ETA 4 min</span>
          </section>
        </div>

        <AlarmCard
          distanceRemaining={distanceRemaining}
          enabled={alarmEnabled}
          onToggle={setAlarmEnabled}
        />

        <button
          className="end-journey-button"
          type="button"
          onClick={onBack}
        >
          <X size={17} />
          End journey
        </button>

        <section className="coordinates-card surface-card">
          <p className="eyebrow">Your GPS location</p>
          {location.isLoading && <p>Locating your device...</p>}
          {location.error && <p className="gps-error">{location.error}</p>}
          {location.latitude !== null && (
            <p>
              Latitude: {location.latitude.toFixed(6)} · Longitude: {location.longitude.toFixed(6)}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
