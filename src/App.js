import React from 'react';
import './styles/global.css';
import Map from './components/Map';

function App() {
  return (
    <div className="app">
      {/* Modern, sleek header */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-text">
                <span className="logo-primary">AHDB</span>
                <span className="logo-divider"></span>
                <span className="logo-secondary">eFoodChainMap</span>
              </div>
            </div>
            
            <nav className="main-navigation">
              <ul className="nav-menu">
                <li className="nav-item active">
                  <a href="/" className="nav-link">Map</a>
                </li>
                <li className="nav-item">
                  <a href="/about" className="nav-link">About</a>
                </li>
                <li className="nav-item">
                  <a href="/help" className="nav-link">Help</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Map />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <p className="copyright">© {new Date().getFullYear()} Agriculture and Horticulture Development Board. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
