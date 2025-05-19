// src/components/leafletSetup.js
import L from 'leaflet';

// Ensure this runs before any Leaflet code
(function setupLeaflet() {
  console.log('Setting up Leaflet icons...');
  
  // Inject Leaflet CSS if needed
  if (!document.getElementById('leaflet-cdn-css')) {
    const leafletCss = document.createElement('link');
    leafletCss.id = 'leaflet-cdn-css';
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(leafletCss);
  }

  // Try-catch block to handle any initialization errors
  try {
    // Directly set icon paths - no reliance on internal Leaflet functions
    L.Icon.Default.imagePath = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/';
  } catch (e) {
    console.warn('Unable to set Leaflet image path:', e);
  }
})();

// Create a direct marker icon creator that doesn't rely on Leaflet's internal mechanisms
export const createMarkerIcon = (options = {}) => {
  try {
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
  } catch (e) {
    console.error('Error creating marker icon:', e);
    // Return a simple div icon as fallback
    return L.divIcon({
      className: 'fallback-icon',
      html: '<div style="width:10px;height:10px;background:red;border-radius:50%;"></div>',
      iconSize: [10, 10]
    });
  }
};

// Create a custom div icon (for your species markers)
export const createCustomDivIcon = (color) => {
  try {
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
  } catch (e) {
    console.error('Error creating custom div icon:', e);
    // Return a simple div icon as fallback
    return L.divIcon({
      className: 'fallback-icon',
      html: `<div style="background-color:${color || 'red'};width:10px;height:10px;border-radius:50%;"></div>`,
      iconSize: [10, 10]
    });
  }
};

export default { createMarkerIcon, createCustomDivIcon };
