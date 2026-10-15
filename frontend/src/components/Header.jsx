export default function Header({ journeyMode = false, onBack }) {
  return (
    <header className="app-header">
      <div className="navbar-left">
        <img
          className="navbar-logo"
          src="/assets/namma-mangaluru-bus-location.png"
          alt="Namma Mangaluru bus and location logo"
        />

        <div className="brand-text">
          <h2>NAMMA MANGALURU</h2>
          <p>ನಿಮ್ಮ ಬಸ್ ಸಂಗಾತಿ · live route finder</p>
        </div>
      </div>

      {journeyMode && <nav className="navbar-links">
          <button className="header-action" onClick={onBack}>
            ← Back
          </button>
      </nav>}
    </header>
  );
}
