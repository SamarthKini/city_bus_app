import { Bell, BusFront, Menu } from "lucide-react";

export default function Header({ journeyMode = false, onBack }) {
  return (
    <header className="app-header">
      <div className="header-navigation">
        <button
          aria-label="Open navigation"
          className="header-icon-button"
          type="button"
        >
          <Menu size={19} />
        </button>
        <div className="brand__icon">
          <BusFront size={24} />
        </div>
        <div>
          <p className="brand__title">City Bus Route Finder</p>
          <p className="brand__subtitle">Plan your journey across Mangalore</p>
        </div>
      </div>

      {journeyMode ? (
        <button
          className="header-action"
          type="button"
          onClick={onBack}
        >
          Back to routes
        </button>
      ) : (
        <button
          aria-label="Notifications"
          className="header-icon-button"
          type="button"
        >
          <Bell size={18} />
        </button>
      )}
    </header>
  );
}
