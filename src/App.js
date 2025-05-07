import React from 'react';
import Map from './components/Map';
import './styles/global.css';

const App = () => {
  // AHDB Color Palette
  const colors = {
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

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 text-white" style={{ backgroundColor: colors.primary }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">AHDB eFoodChainMap</h1>
          <img src="https://projectblue.blob.core.windows.net/media/Default/Assets/AHDB_Facebook_Logo.png" alt="AHDB Logo" className="h-10" />
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-6xl mx-auto p-4">
        {/* Introduction Banner */}
        <div className="p-4 mb-6 rounded-md border-l-4 bg-gray-100" style={{ borderLeftColor: colors.secondary }}>
          <h2 className="text-xl font-semibold mb-2" style={{ color: colors.textDark }}>Food Chain Map</h2>
          <p className="mb-2" style={{ color: colors.textMedium }}>
            Interactive map showing food chain locations across the UK. Filter by species and region to find relevant locations.
          </p>
        </div>
        
        {/* Map Container */}
        <div className="bg-white p-6 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4" style={{ color: colors.textDark }}>AHDB Food Chain Map</h2>
          
          {/* Map Component */}
          <Map />
          
          {/* Additional Info */}
          <div className="mt-6 p-4 rounded-md bg-gray-100">
            <h3 className="text-lg font-medium mb-2" style={{ color: colors.secondary }}>About This Map</h3>
            <p style={{ color: colors.textMedium }}>
              This map displays food chain locations across the UK. Use the filters to narrow down by species or region.
              Click on a marker to see detailed information about each location.
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="px-4 py-6 text-white mt-10" style={{ backgroundColor: colors.textDark }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src="https://projectblue.blob.core.windows.net/media/Default/Assets/AHDB_Facebook_Logo.png" alt="AHDB Logo" className="h-8 mb-2" />
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
