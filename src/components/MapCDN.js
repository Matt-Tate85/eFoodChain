// src/components/MapCDN.js
import React, { useState, useEffect, useRef } from 'react';

// We'll load Leaflet via CDN instead of npm
const MapCDN = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef(null);
  
  // Load leaflet from CDN on component mount
  useEffect(() => {
    // Add Leaflet CSS
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(linkEl);
    
    // Add Leaflet JS
    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    scriptEl.onload = () => {
      initializeMap();
    };
    document.body.appendChild(scriptEl);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(linkEl);
      document.body.removeChild(scriptEl);
    };
  }, []);
  
  // Initialize map once Leaflet is loaded
  const initializeMap = () => {
    if (!mapRef.current) return;
    
    const L = window.L; // Get Leaflet from global window
    
    // Create map
    const map = L.map(mapRef.current).setView([54.7023545, -3.2765753], 6);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add a sample marker
    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    
    L.marker([51.505, -0.09], { icon }).addTo(map)
      .bindPopup('London')
      .openPopup();
    
    setIsLoading(false);
    setMapInitialized(true);
  };
  
  return (
    <div className="map-container">
      <h2 className="section-title">AHDB eFoodChain Map</h2>
      {isLoading && <div>Loading map...</div>}
      <div ref={mapRef} style={{ height: "600px", width: "100%" }}></div>
    </div>
  );
};

export default MapCDN;
