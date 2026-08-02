import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BellRing, MapPin, X } from "lucide-react";
import Header from "../components/Header";
import useLocation from "../hooks/useLocation";
import { getJourneyStops, getRouteById, getStopById, liveTrackingSample } from "../mockdata";
import { buildGoogleMapsRouteUrl } from "../utils/mapsLink";

function playAlarmSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();

  const playTone = (freq, startTime, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const now = ctx.currentTime;
  playTone(880, now, 0.25);
  playTone(1046.5, now + 0.28, 0.35);
}

export default function LiveTracking({ currentView, selectedRouteId, setCurrentView }) {
  const active = liveTrackingSample;
  const route = getRouteById(active.routeId);
  const currentStop = getStopById(active.currentStopId);
  const nextStop = getStopById(active.nextStopId);
  const location = useLocation();
  const [nearestStop, setNearestStop] = useState(null);
  const [destinationReached, setDestinationReached] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const dismissedAlarmRef = useRef(false);

  useEffect(() => {
    if (location.latitude === null || location.longitude === null) {
      return;
    }

    const fetchNearestStop = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/nearest-stop/", {
          params: {
            lat: location.latitude,
            lng: location.longitude,
            route_number: route?.number,
          },
        });

        setNearestStop(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("Route or stops not available yet.");
        } else {
          console.error(error);
        }
      }
    };

    fetchNearestStop();
  }, [location.latitude, location.longitude, route?.number]);

  useEffect(() => {
    if (!nearestStop) {
      return;
    }

    if (!alarmEnabled) {
      setDestinationReached(false);
      return;
    }

    if (nearestStop.distance_meters < 200) {
      if (!destinationReached && !dismissedAlarmRef.current) {
        setDestinationReached(true);
        playAlarmSound();
      }
    } else {
      setDestinationReached(false);
    }
  }, [nearestStop, destinationReached, alarmEnabled]);

  const etaText = nearestStop?.distance_meters != null
    ? `${Math.round(nearestStop.distance_meters)} m away`
    : `${active.etaMinutes} min (${active.etaTime})`;

  const liveDistanceText = nearestStop?.distance_meters != null
    ? `${Math.round(nearestStop.distance_meters)} m`
    : `${active.etaMinutes} min`;

  const destinationName = nearestStop?.name || currentStop?.name || "—";
  const journeyStops = getJourneyStops(active.routeId, active.sourceStopId, active.destinationStopId);
  const destinationStop = getStopById(active.destinationStopId);
  const liveMapsRouteUrl = buildGoogleMapsRouteUrl(
    location.latitude !== null && location.longitude !== null && destinationStop
      ? [
          { latitude: location.latitude, longitude: location.longitude },
          destinationStop,
        ]
      : []
  );

  const dismissAlarm = () => {
    dismissedAlarmRef.current = true;
    setDestinationReached(false);
  };

  return (
    <div className="app-shell">
      <style>{`
        .alarm-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: #12203A;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 28px 20px;
          overflow: hidden;
        }

        .alarm-overlay__card {
          width: min(100%, 420px);
          min-height: min(100vh - 56px, 720px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #fff;
          position: relative;
        }

        .alarm-overlay__close {
          position: absolute;
          top: 2px;
          right: 0;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.86);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
        }

        .alarm-overlay__label {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
        }

        .alarm-overlay__badge {
          position: relative;
          width: 170px;
          height: 170px;
          margin-top: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 40%, #9fe6b2 0%, #6fc487 68%, #4da96e 100%);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.24);
        }

        .alarm-overlay__ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(191, 246, 206, 0.85);
          opacity: 0;
          transform: scale(0.8);
          animation: alarmPulse 2.6s infinite;
        }

        .alarm-overlay__ring--2 {
          animation-delay: 0.8s;
        }

        .alarm-overlay__ring--3 {
          animation-delay: 1.6s;
        }

        .alarm-overlay__icon {
          position: relative;
          z-index: 2;
          color: #fff;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
        }

        .alarm-overlay__subcopy {
          margin-top: 28px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
        }

        .alarm-overlay__destination {
          margin-top: 8px;
          font-size: clamp(1.75rem, 4vw, 2.6rem);
          line-height: 1.15;
          font-weight: 800;
        }

        .alarm-overlay__meta {
          margin-top: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
        }

        .alarm-overlay__distance {
          margin-top: 8px;
          font-size: clamp(2rem, 5vw, 3rem);
          line-height: 1.1;
          font-weight: 800;
          color: #8BFAAB;
        }

        .alarm-overlay__button {
          margin-top: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          border-radius: 999px;
          background: #fff;
          color: #12203A;
          padding: 14px 22px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.16);
        }

        @keyframes alarmPulse {
          0% {
            opacity: 0;
            transform: scale(0.72);
          }
          15% {
            opacity: 0.75;
          }
          70% {
            opacity: 0;
            transform: scale(1.55);
          }
          100% {
            opacity: 0;
            transform: scale(1.55);
          }
        }
      `}</style>
      <main style={{ width: "min(1100px, calc(100% - 96px))", margin: "0 auto", padding: "28px 0 40px", position: "relative" }}>
        <section style={{ padding: 20, borderRadius: 18, background: "#fff", border: "1px solid #d7deea", boxShadow: "0 10px 24px rgba(15, 23, 42, .06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0E7C7B", textTransform: "uppercase" }}>Live tracking</div>
              <h1 style={{ margin: "8px 0 6px", fontSize: 24, color: "#12203A" }}>{route?.name || "Live route"}</h1>
              <p style={{ margin: 0, color: "#5A6B82" }}>Bus approaching {nextStop?.name || "the next stop"}</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={() => setCurrentView("detail")} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #d7deea", background: "#fff", color: "#12203A", fontWeight: 700 }}>Back to route</button>
              <button type="button" onClick={() => setCurrentView("home")} style={{ padding: "10px 14px", borderRadius: 12, border: 0, background: "#12203A", color: "#fff", fontWeight: 700 }}>End journey</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18, marginTop: 18 }}>
            <div style={{ padding: 16, borderRadius: 14, background: "#F8FBFF", border: "1px solid #E4EBF4" }}>
              <div style={{ color: "#61738A", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Distance remaining</div>
              <strong style={{ display: "block", marginTop: 6, color: "#12203A", fontSize: 28 }}>{liveDistanceText}</strong>
            </div>
            <div style={{ padding: 16, borderRadius: 14, background: "#F8FBFF", border: "1px solid #E4EBF4", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: "#61738A", fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Alarm</div>
                <strong style={{ display: "block", marginTop: 6, color: "#12203A" }}>{alarmEnabled ? "ON" : "OFF"}</strong>
              </div>
              <button
                type="button"
                aria-pressed={alarmEnabled}
                onClick={() => setAlarmEnabled((currentValue) => !currentValue)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid #d7deea",
                  background: alarmEnabled ? "#EAF8F7" : "#f8fafc",
                  color: alarmEnabled ? "#0E7C7B" : "#5A6B82",
                  fontWeight: 700,
                }}
              >
                {alarmEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14, color: "#12203A", fontSize: 12, fontWeight: 700 }}>
            {location.isLoading && <p style={{ margin: 0 }}>Locating your device...</p>}
            {location.error && <p style={{ margin: 0, color: "#B42318" }}>{location.error}</p>}
            {location.latitude !== null && (
              <p style={{ margin: 0 }}>
                Your GPS location: {location.latitude.toFixed(6)} · {location.longitude.toFixed(6)}
              </p>
            )}
          </div>

          <div style={{ marginTop: 18, padding: 18, borderRadius: 18, background: "#fff", border: "1px solid #d7deea" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, color: "#12203A" }}>Route stops</h2>
              <button
                type="button"
                onClick={() => {
                  if (liveMapsRouteUrl) {
                    window.open(liveMapsRouteUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                disabled={!liveMapsRouteUrl}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #d7deea",
                  background: liveMapsRouteUrl ? "#EAF8F7" : "#F5F7FB",
                  color: liveMapsRouteUrl ? "#0E7C7B" : "#7A889A",
                  fontWeight: 700,
                  cursor: liveMapsRouteUrl ? "pointer" : "not-allowed",
                }}
              >
                {liveMapsRouteUrl ? "View on Map" : "Waiting for location..."}
              </button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {journeyStops.map((stop) => (
                <div key={`${stop.stopId}-${stop.sequence}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "#F8FBFF", border: "1px solid #E4EBF4" }}>
                  <div style={{ width: 30, minWidth: 30, color: "#12203A", fontWeight: 800, fontSize: 14 }}>#{stop.sequence}</div>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: stop.isCurrentBusPosition ? "#0E7C7B" : stop.isYourDestination ? "#C0392B" : "#2A6FD8",
                      boxShadow: stop.isCurrentBusPosition
                        ? "0 0 0 4px rgba(14, 124, 123, 0.18)"
                        : stop.isYourDestination
                          ? "0 0 0 4px rgba(192, 57, 43, 0.15)"
                          : "0 0 0 4px rgba(42, 111, 216, 0.15)",
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ color: "#12203A", fontWeight: 700 }}>{stop.name}</span>
                    {stop.sequence === 1 && <span style={{ color: "#5A6B82", fontSize: 12, fontWeight: 700 }}>(Origin)</span>}
                    {stop.isYourDestination && (
                      <span style={{ padding: "3px 8px", borderRadius: 999, background: "#FDECEC", color: "#C0392B", fontSize: 11, fontWeight: 800 }}>
                        Your Destination
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {destinationReached && (
        <div className="alarm-overlay" onClick={dismissAlarm}>
          <div className="alarm-overlay__card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="alarm-overlay__close" onClick={dismissAlarm} aria-label="Dismiss alarm overlay">
              <X size={22} />
            </button>
            <div className="alarm-overlay__label">Alarm</div>
            <div className="alarm-overlay__badge" aria-hidden="true">
              <span className="alarm-overlay__ring" />
              <span className="alarm-overlay__ring alarm-overlay__ring--2" />
              <span className="alarm-overlay__ring alarm-overlay__ring--3" />
              <BellRing size={46} className="alarm-overlay__icon" />
            </div>
            <div className="alarm-overlay__subcopy">Approaching</div>
            <div className="alarm-overlay__destination">{destinationName}</div>
            <div className="alarm-overlay__meta">You will reach in</div>
            <div className="alarm-overlay__distance">{liveDistanceText}</div>
            <button
              type="button"
              className="alarm-overlay__button"
              onClick={() => {
                if (liveMapsRouteUrl) {
                  window.open(liveMapsRouteUrl, "_blank", "noopener,noreferrer");
                }
                setCurrentView("detail");
              }}
              disabled={!liveMapsRouteUrl}
            >
              <MapPin size={18} />
              {liveMapsRouteUrl ? "View on Map" : "Waiting for location..."}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
