import { Clock3, Map, MapPin } from "lucide-react";

const stats = [
  { label: "Travel time", icon: Clock3, value: "30 min" },
  { label: "Distance", icon: Map, value: "9.0 km" },
];

export default function StatsCards({ stopsCount }) {
  return (
    <div className="stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            className="stat-card"
            key={stat.label}
          >
            <Icon size={17} />
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        );
      })}

      <div className="stat-card">
        <MapPin size={17} />
        <span>Stops</span>
        <strong>{stopsCount}</strong>
      </div>
    </div>
  );
}
