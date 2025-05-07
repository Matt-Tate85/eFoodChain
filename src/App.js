import React from 'react';
import './styles/global.css';
import Map from './components/Map';

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <h1 style={{ color: '#0090d4' }}>AHDB eFoodChainMap</h1>
          </div>
          <nav className="main-nav">
            <ul>
              <li><a href="/">Map</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/help">Help</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Map />
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#1f4350', 
        color: 'white', 
        padding: '2rem 0 1rem',
        marginTop: '2rem'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <p>© {new Date().getFullYear()} Agriculture and Horticulture Development Board. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
