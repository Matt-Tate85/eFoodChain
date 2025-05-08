import React, { useState } from 'react';
import Map from './components/Map';
import './styles/global.css';

// AHDB Color Palette - defined outside component
const AHDB_COLORS = {
  primary: "#0090d4",
  secondary: "#6da32f",
  textDark: "#1f4350",
  textMedium: "#575756",
  bgHighlight: "#dfd5b4",
  bgSecondary: "#f5f5f5",
  border: "#9db7c2",
  success: "#025328",
  warning: "#ed7013",
  error: "#7b3010",
  info: "#00abe4"
};

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-message">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={AHDB_COLORS.error} strokeWidth="2"/>
            <path d="M12 8V12" stroke={AHDB_COLORS.error} strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill={AHDB_COLORS.error}/>
          </svg>
          <p>Sorry, something went wrong loading the map.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [isMapLoading, setIsMapLoading] = useState(true);

  return (
    <div className="app-container">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <h1 className="app-title">AHDB eFoodChainMap</h1>
            <img 
              src="https://projectblue.blob.core.windows.net/media/Default/Assets/AHDB_Facebook_Logo.png" 
              alt="AHDB Logo" 
              className="app-logo"
            />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main id="main-content" className="main-content">
        <div className="container">
          {/* Introduction Banner */}
          <div className="intro-banner">
            <p>Interactive map showing food chain locations across the UK. Filter by species and region to find relevant locations.</p>
          </div>
          
          {/* Map Section */}
          <section className="content-section">
            <ErrorBoundary>
              <div className="content-card">
                {isMapLoading && (
                  <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading map data...</p>
                  </div>
                )}
                
                <Map onMapLoaded={() => setIsMapLoading(false)} />
                
                {/* Additional Info */}
                <div className="info-box">
                  <h3 className="info-title">About This Map</h3>
                  <p>This map displays food chain locations across the UK. Use the filters to narrow down by species or region. Click on a marker to see detailed information about each location.</p>
                </div>
              </div>
            </ErrorBoundary>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-branding">
              <img 
                src="https://projectblue.blob.core.windows.net/media/Default/Assets/AHDB_Facebook_Logo.png" 
                alt="AHDB Logo" 
                className="footer-logo"
              />
              <p className="copyright">© Agriculture and Horticulture Development Board {new Date().getFullYear()}</p>
            </div>
            <div className="footer-info">
              <p>This application meets WCAG 2.1 AA accessibility standards</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
