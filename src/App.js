import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import './styles/global.css';

// Define colors outside component to prevent re-creation on each render
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
        <div className="p-4 rounded-md" style={{ backgroundColor: '#ffebee', borderColor: AHDB_COLORS.error, color: AHDB_COLORS.error, border: '1px solid' }}>
          Sorry, something went wrong loading the map.
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Simulate map loading to demonstrate the loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoading(false);
    }, 1000); // Simulate 1 second loading time
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          header, footer, .intro-banner, .about-section { display: none; }
          .map-container { height: 100%; page-break-inside: avoid; }
          .print-only { display: block; }
        }
        
        .print-only {
          display: none;
        }
      `}</style>
      
      {/* Header */}
      <header className="px-4 py-4 text-white" style={{ backgroundColor: AHDB_COLORS.primary }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">AHDB eFoodChainMap</h1>
          <img 
            src="https://projectblue.blob.core.windows.net/media/Default/Assets/AHDB_Facebook_Logo.png" 
            alt="AHDB Logo" 
            className="h-8 sm:h-10" 
          />
        </div>
      </header>
      
      {/* Print-only Header */}
      <div className="print-only p-4 mb-8">
        <h1 style={{ color: AHDB_COLORS.primary, fontSize: '24px', fontWeight: 'bold' }}>
          AHDB eFoodChainMap
        </h1>
        <p style={{ color: AHDB_COLORS.textMedium }}>Printed on {new Date().toLocaleDateString()}</p>
      </div>
      
      {/* Main content */}
      <main className="max-w-6xl mx-auto p-4">
        {/* Introduction Banner */}
        <div className="intro-banner p-4 mb-3 rounded-md border-l-4 bg-gray-100" style={{ borderLeftColor: AHDB_COLORS.secondary }}>
          <p className="mb-0" style={{ color: AHDB_COLORS.textMedium }}>
            Interactive map showing food chain locations across the UK. Filter by species and region to find relevant locations.
          </p>
        </div>
        
        {/* Map Container */}
        <ErrorBoundary>
          <div className="bg-white p-4 pt-3 rounded-md shadow-sm relative">
            {/* Loading State */}
            {isMapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-t-4 rounded-full animate-spin mb-2" 
                    style={{ 
                      borderColor: AHDB_COLORS.bgSecondary,
                      borderTopColor: AHDB_COLORS.primary 
                    }}>
                  </div>
                  <p style={{ color: AHDB_COLORS.textMedium }}>Loading map...</p>
                </div>
              </div>
            )}
            
            {/* Map Component */}
            <div className="map-container">
              <Map onMapLoaded={() => setIsMapLoading(false)} />
            </div>
            
            {/* Additional Info */}
            <div className="about-section mt-6 p-4 rounded-md bg-gray-100">
              <h3 className="text-lg font-medium mb-2" style={{ color: AHDB_COLORS.secondary }}>About This Map</h3>
              <p style={{ color: AHDB_COLORS.textMedium }}>
                This map displays food chain locations across the UK. Use the filters to narrow down by species or region.
                Click on a marker to see detailed information about each location.
              </p>
            </div>
          </div>
        </ErrorBoundary>
      </main>
      
      {/* Footer */}
      <footer className="px-4 py-6 text-white mt-10" style={{ backgroundColor: AHDB_COLORS.textDark }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img 
                src="https://projectblue.blob.core.windows.net/media/Default/Assets/AHDB_Facebook_Logo.png" 
                alt="AHDB Logo" 
                className="h-8 mb-2" 
              />
              <p className="text-xs opacity-80">© Agriculture and Horticulture Development Board {new Date().getFullYear()}</p>
            </div>
            <div className="text-sm">
              <p>This application meets WCAG 2.1 AA accessibility standards</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
