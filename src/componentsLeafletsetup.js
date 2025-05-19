// leafletSetup.js
import L from 'leaflet';

// This file should be imported before any other Leaflet-related components

// Ensure this runs before any Leaflet code
(function setupLeaflet() {
  // Inject Leaflet CSS if needed
  if (!document.getElementById('leaflet-cdn-css')) {
    const leafletCss = document.createElement('link');
    leafletCss.id = 'leaflet-cdn-css';
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(leafletCss);
  }
  
  // Fix icon paths directly
  if (L.Icon && L.Icon.Default) {
    L.Icon.Default.imagePath = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/';
    
    // If the mergeOptions function exists, use it
    if (typeof L.Icon.Default.mergeOptions === 'function') {
      try {
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
      } catch (e) {
        console.warn('Failed to merge icon options:', e);
      }
    }
    
    // Direct prototype modification as fallback
    try {
      L.Icon.Default.prototype.options.iconUrl = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png';
      L.Icon.Default.prototype.options.iconRetinaUrl = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png';
      L.Icon.Default.prototype.options.shadowUrl = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png';
    } catch (e) {
      console.warn('Failed to set icon options directly:', e);
    }
  }
})();

// Create a direct marker icon creator that doesn't rely on Leaflet's internal mechanisms
export const createMarkerIcon = (options = {}) => {
  return new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    ...options
  });
};

// Create a custom div icon (for your species markers)
export const createCustomDivIcon = (color) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

export default { createMarkerIcon, createCustomDivIcon };
