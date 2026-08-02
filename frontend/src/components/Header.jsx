export default function Header({ journeyMode = false, onBack, currentView = "home", setCurrentView }) {
  const navItems = [
    {
      label: "Plan a trip",
      value: "home",
      onClick: () => setCurrentView?.("home"),
    },
    {
      label: "Live tracking",
      value: "live",
      onClick: () => setCurrentView?.("live"),
    },
  ];

  return (
    <header className="app-header">
      <div className="navbar-left">
        <div className="navbar-logo"><span>MCT</span></div>

        <div className="brand-text">
          <h2>NAMMA MANGALURU</h2>
          <p>ನಿಮ್ಮ ಬಸ್ ಸಂಗಾತಿ · live route finder</p>
        </div>
      </div>

      <nav className="navbar-links">
        {!journeyMode ? (
          <>
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`navbar-link ${currentView === item.value ? "navbar-link--active" : ""}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ))}
          </>
        ) : (
          <button className="header-action" onClick={onBack}>
            ← Back
          </button>
        )}
      </nav>
    </header>
  );
}
