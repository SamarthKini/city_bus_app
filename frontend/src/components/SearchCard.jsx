import { CircleDot, MapPin, Search } from "lucide-react";

export default function SearchCard({
  stops,
  sourceStop,
  destinationStop,
  loading,
  error,
  onSourceChange,
  onDestinationChange,
  onSearch,
}) {
  return (
    <section className="search-card surface-card fade-up">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Plan your journey</p>
          <h1>Find your bus route</h1>
        </div>
        <span className="search-card__badge">Route finder</span>
      </div>

      <div className="stop-fields">
        <div className="stop-field">
          <CircleDot size={17} />
          <label className="field-label">
            Source stop
            <select
              value={sourceStop}
              onChange={(event) => onSourceChange(event.target.value)}
            >
              <option value="">Choose a starting stop</option>
              {stops.map((stop) => (
                <option
                  key={stop.id}
                  value={stop.id}
                >
                  {stop.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="stop-field">
          <MapPin size={17} />
          <label className="field-label">
            Destination stop
            <select
              value={destinationStop}
              onChange={(event) => onDestinationChange(event.target.value)}
            >
              <option value="">Choose a destination stop</option>
              {stops.map((stop) => (
                <option
                  key={stop.id}
                  value={stop.id}
                >
                  {stop.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <button
        className="primary-button"
        type="button"
        disabled={loading}
        onClick={onSearch}
      >
        <Search size={18} />
        {loading ? "Searching routes..." : "Search routes"}
      </button>

      {error && <p className="form-error">{error}</p>}
    </section>
  );
}
