import React from 'react';
import './styles/global.css';
import Map from './components/Map';

// AHDB Colors - Access these from your global CSS if available
const ahdbBlue = "#0090d4";
const ahdbGreen = "#6da32f";
const ahdbText = "#575756";
const credible = "#1f4350";

function App() {
  return (
    <div className="app">
      {/* Modern Header */}
      <header className="header">
        <div className="container header-container">
          <div className="logo-container">
            <h1 className="site-title">
              <span className="title-primary">AHDB</span>
              <span className="title-secondary">eFoodChainMap</span>
            </h1>
          </div>
          
          <nav className="main-nav" aria-label="Main navigation">
            <ul className="nav-list">
              <li className="nav-item">
                <a href="/" className="nav-link nav-link-active">
                  <span className="nav-icon">🗺️</span>
                  <span className="nav-text">Map</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="/about" className="nav-link">
                  <span className="nav-icon">ℹ️</span>
                  <span className="nav-text">About</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="/help" className="nav-link">
                  <span className="nav-icon">❓</span>
                  <span className="nav-text">Help</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Map />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} Agriculture and Horticulture Development Board. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
