import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import Header from "../components/Header";
import useLocation from "../hooks/useLocation";
import { buildGoogleMapsRouteUrl } from "../utils/mapsLink";
import { extractRouteSegment } from "../utils/routeData";
import {
  distanceInMeters,
  findNearestRouteStop,
  resolveRouteDestination,
  shouldTriggerArrivalAlarm,
} from "../utils/stopDistance";

const ARRIVAL_THRESHOLD_METERS = 500;
const EMPTY_ROUTE_STOPS = [];

function formatDistance(meters) {
  if (meters === null) return "Unavailable";
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(2)} km`;
}

export default function LiveTracking({ currentView, route, setCurrentView, destinationStopId, onDestinationChange }) {
  const location = useLocation();
  const routeNumber = route?.isConnection ? null : route?.busNumber ?? route?.routeNumber;
  const unavailable = !routeNumber;
  const routeStops = route?.stopObjects ?? EMPTY_ROUTE_STOPS;
  const fullRouteStops = route?.fullJourney?.stopObjects ?? routeStops;
  const journeyOriginStopId = route?.originStopId ?? route?.stopIds?.[0] ?? null;
  const mapUrl = buildGoogleMapsRouteUrl(routeStops);
  const [monitoring, setMonitoring] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioError, setAudioError] = useState("");
  const triggeredRef = useRef(false);
  const audioContextRef = useRef(null);

  const destination = useMemo(
    () => resolveRouteDestination(routeStops, destinationStopId),
    [routeStops, destinationStopId],
  );
  const locationIsValid = !location.error
    && Number.isFinite(location.latitude)
    && Number.isFinite(location.longitude)
    && location.latitude >= -90 && location.latitude <= 90
    && location.longitude >= -180 && location.longitude <= 180;
  const destinationIsUsable = destination.status === "ready";
  const destinationDistance = locationIsValid && destinationIsUsable
    ? distanceInMeters(
      location.latitude,
      location.longitude,
      destination.coordinates.latitude,
      destination.coordinates.longitude,
    )
    : null;
  const nearestStop = useMemo(() => {
    if (unavailable || !locationIsValid) return null;
    return findNearestRouteStop(location.latitude, location.longitude, routeStops);
  }, [location.latitude, location.longitude, locationIsValid, routeStops, unavailable]);

  useEffect(() => {
    const shouldTrigger = shouldTriggerArrivalAlarm(destinationDistance, {
      monitoring,
      destinationIsUsable,
      locationIsValid,
      hasTriggered: triggeredRef.current,
    }, ARRIVAL_THRESHOLD_METERS);
    if (!shouldTrigger) return;

    // Set the ref synchronously so a repeated GPS update cannot play again.
    triggeredRef.current = true;
    window.setTimeout(() => {
      setHasTriggered(true);
      if (!soundEnabled) {
        setAudioError("Sound was not enabled before arrival; the on-screen warning is active.");
        return;
      }

      try {
        const audioContext = audioContextRef.current;
        if (!audioContext || audioContext.state !== "running") {
          throw new Error("Audio playback is unavailable or suspended.");
        }
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.frequency.value = 880;
        gain.gain.value = 0.16;
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.7);
        setAudioError("");
      } catch {
        setAudioError("The on-screen arrival warning is active, but this browser could not play the sound.");
      }
    }, 0);
  }, [destinationDistance, destinationIsUsable, hasTriggered, locationIsValid, monitoring, soundEnabled]);

  useEffect(() => () => {
    audioContextRef.current?.close().catch(() => {});
  }, []);

  async function enableSound() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error("Audio playback is not supported.");
      const context = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = context;
      await context.resume();
      if (context.state !== "running") throw new Error("Audio playback did not start.");
      setSoundEnabled(true);
      setAudioError("");
    } catch {
      setSoundEnabled(false);
      setAudioError("Sound could not be enabled. The visible arrival warning will still work.");
    }
  }

  function handleDestinationChange(event) {
    const nextId = event.target.value || null;
    if (String(nextId ?? "") === String(destinationStopId ?? "")) return;
    triggeredRef.current = false;
    setHasTriggered(false);
    setMonitoring(false);
    setAudioError("");
    onDestinationChange?.(nextId);
  }

  function startNewJourney() {
    if (!destinationIsUsable) return;
    triggeredRef.current = false;
    setHasTriggered(false);
    setAudioError("");
    setMonitoring(true);
  }

  let alarmStatus = "Not monitoring";
  if (destination.status === "unselected") alarmStatus = "Select a destination stop.";
  else if (destination.status === "not-on-route") alarmStatus = "The selected destination is not on this route. Choose a route stop.";
  else if (destination.status === "unverified") alarmStatus = "This destination has unverified coordinates and cannot trigger the alarm.";
  else if (destination.status !== "ready") alarmStatus = "The destination has missing or invalid coordinates and cannot trigger the alarm.";
  else if (!locationIsValid) alarmStatus = location.error || (location.isLoading ? "Waiting for a valid GPS fix." : "Current location is unavailable.");
  else if (hasTriggered) alarmStatus = "Arrival threshold reached.";
  else if (monitoring) alarmStatus = `Monitoring for arrival within ${ARRIVAL_THRESHOLD_METERS} metres.`;

  if (!route) {
    return <div className="app-shell"><Header currentView={currentView} setCurrentView={setCurrentView} /><main className="route-detail-page"><section className="detail-card"><h1>Live tracking unavailable</h1><p>Select a route before starting live tracking.</p><button type="button" className="detail-button detail-button--secondary" onClick={() => setCurrentView("home")}>Back to search</button></section></main></div>;
  }

  return (
    <div className="app-shell"><Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="route-detail-page">
        <section className="detail-card route-detail-card"><div className="detail-card__header"><div>
          <div className="detail-kicker">Live tracking</div><h1>{route.routeName || `Bus ${route.busNumber ?? "—"}`}</h1>
          <p>{unavailable ? "Live tracking unavailable for transfer routes." : nearestStop ? `Nearest stop: ${nearestStop.name}, ${formatDistance(nearestStop.distance_meters)} away` : location.error || (location.isLoading ? "Waiting for your location…" : "No usable location or stop coordinates are available for this route.")}</p>
          {location.accuracy !== null && locationIsValid
            ? <p className="live-location-accuracy">Location accuracy estimate: ±{Math.round(location.accuracy)} m</p>
            : <p className="live-location-accuracy">Location accuracy estimate unavailable.</p>}
        </div><div className="detail-actions"><button type="button" className="detail-button detail-button--secondary" onClick={() => setCurrentView("detail")}>Back to route</button><button type="button" className="detail-button detail-button--map" disabled={!mapUrl} onClick={() => mapUrl && window.open(mapUrl, "_blank", "noopener,noreferrer")}><MapPin size={16} /> {mapUrl ? "View on Map" : "Map unavailable"}</button></div></div></section>

        <section className="detail-card arrival-alarm-card" aria-labelledby="arrival-alarm-heading">
          <div className="arrival-alarm-card__heading">
            <div><div className="detail-kicker">Destination arrival alarm</div><h2 id="arrival-alarm-heading">Straight-line GPS proximity alert</h2></div>
            <span className={`arrival-alarm-status${hasTriggered ? " arrival-alarm-status--arrived" : ""}`} role="status">{alarmStatus}</span>
          </div>
          <p className="arrival-alarm-card__disclaimer">This alert uses straight-line distance from your GPS position to the selected stop, not distance along the bus road. Location and sound may not update reliably when this tab is in the background or your phone is locked.</p>

          {destination.stop && destination.status === "ready" && (
            <div className="arrival-alarm-distance" aria-live="polite">
              <span>Distance to {destination.stop.name}</span>
              <strong>{destinationDistance === null ? "Waiting for valid GPS" : formatDistance(destinationDistance)}</strong>
            </div>
          )}
          {destination.status !== "ready" && destination.status !== "unselected" && <p className="arrival-alarm-message" role="alert">{alarmStatus}</p>}
          {!locationIsValid && location.error && <p className="arrival-alarm-message" role="alert">{location.error} The arrival alarm is paused until a new valid GPS position is available.</p>}

          <label className="arrival-alarm-destination" htmlFor="arrival-destination">
            <span>Destination stop</span>
            <select id="arrival-destination" value={destination.status === "ready" || destination.stop ? String(destinationStopId ?? "") : ""} onChange={handleDestinationChange}>
              <option value="">Choose a stop on this route</option>
              {fullRouteStops.map((stop, index) => {
                if (!stop) return null;
                const segment = extractRouteSegment(route, journeyOriginStopId, stop.id);
                if (!segment) return null;
                const resolved = resolveRouteDestination(segment.stopObjects, stop.id);
                return <option key={`${stop.id}-${index}`} value={String(stop.id)} disabled={resolved.status !== "ready"}>{index + 1}. {stop.name}{resolved.status === "unverified" ? " — coordinates unverified" : resolved.status !== "ready" ? " — coordinates unavailable" : ""}</option>;
              })}
            </select>
          </label>

          <div className="arrival-alarm-controls">
            <button type="button" className="detail-button detail-button--secondary" onClick={enableSound}>{soundEnabled ? "Sound enabled" : "Enable sound"}</button>
            <button type="button" className="detail-button detail-button--primary" disabled={!destinationIsUsable || monitoring || hasTriggered} onClick={() => setMonitoring(true)}>Start monitoring</button>
            <button type="button" className="detail-button detail-button--secondary" disabled={!monitoring} onClick={() => setMonitoring(false)}>Stop monitoring</button>
            <button type="button" className="detail-button detail-button--map" disabled={!destinationIsUsable} onClick={startNewJourney}>Start new journey</button>
          </div>
          {audioError && <p className={hasTriggered ? "arrival-alarm-message" : "arrival-alarm-hint"} role={hasTriggered ? "alert" : undefined}>{audioError}</p>}
          {hasTriggered && <div className="arrival-alarm-warning" role="alert"><strong>You’re near {destination.stop?.name}.</strong><span>You are within {ARRIVAL_THRESHOLD_METERS} metres of your selected destination.</span></div>}
          <p className="arrival-alarm-card__footnote">Initial alarm threshold: {ARRIVAL_THRESHOLD_METERS} metres. GPS accuracy is an estimate; no exact arrival is guaranteed.</p>
        </section>

        <section className="detail-card route-stops-card"><h2>Route stops</h2><ol className="route-stop-list">{(route.stops || []).map((stop, index) => <li key={`${route.stopIds?.[index] ?? stop}-${index}`} className="route-stop"><span className="route-stop__number">{index + 1}</span><span className="route-stop__marker" /><div className="route-stop__content"><strong>{stop}</strong></div></li>)}</ol></section>
      </main>
    </div>
  );
}
