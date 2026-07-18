import { BellRing } from "lucide-react";

export default function AlarmCard({ enabled, distanceRemaining, onToggle }) {
  const urgencyClass = distanceRemaining <= 100
    ? "alarm-card--urgent"
    : distanceRemaining <= 200
      ? "alarm-card--near"
      : "";

  return (
    <section className={`alarm-card ${urgencyClass}`}>
      <div className="alarm-card__icon">
        <BellRing size={22} />
      </div>
      <div className="alarm-card__content">
        <p className="eyebrow">Destination alarm</p>
        <strong>{enabled ? "ON" : "OFF"}</strong>
        <span>Notify within 200 m</span>
      </div>
      <label className="toggle">
        <input
          checked={enabled}
          type="checkbox"
          onChange={(event) => onToggle(event.target.checked)}
        />
        <span />
      </label>
    </section>
  );
}
