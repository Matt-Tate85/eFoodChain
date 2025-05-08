import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LocationFilter from './LocationFilter';
import '../styles/components/Map.css';
import sampleLocations from '../data/locations';

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

// Fix Leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different species
const createCustomIcon = (color) => {
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

// UK center point
const defaultCenter = [54.7023545, -3.2765753];

// Map Filter Control Component
function MapController({ filteredLocations, center }) {
  const map = useMap();
  
  useEffect(() => {
    if (filteredLocations && filteredLocations.length > 0) {
      // Create bounds including all markers
      const bounds = L.latLngBounds(filteredLocations.map(location => [location.lat, location.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Reset to default view if no markers
      map.setView(center, 6);
    }
  }, [filteredLocations, map, center]);
  
  return null;
}

const Map = ({ onMapLoaded }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    species: [],
    regions: []
  });
  const mapRef = useRef(null);

  // Handle on load callback
  const handleMapLoaded = () => {
    if (onMapLoaded) {
      setTimeout(() => {
        setLoading(false);
        onMapLoaded();
      }, 500); // Small delay to ensure map tiles are loaded
    } else {
      setLoading(false);
    }
  };

  // Fetch locations data
  useEffect(() => {
    // In a real app, fetch from API
    // Using sample data for now
    setLocations(sampleLocations);
  }, []);

  // Filter locations based on active filters
  const filteredLocations = useCallback(() => {
    if (!activeFilters.species.length && !activeFilters.regions.length) {
      return locations;
    }

    return locations.filter(location => {
      const matchesSpecies = !activeFilters.species.length || 
        activeFilters.species.includes(location.species);
      
      const matchesRegion = !activeFilters.regions.length || 
        activeFilters.regions.includes(location.region);
      
      return matchesSpecies && matchesRegion;
    });
  }, [locations, activeFilters]);

  // Handle filter change
  const handleFilterChange = (filterType, values) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  // Get all available species for filter
  const availableSpecies = [...new Set(locations.map(location => location.species))];
  
  // Get all available regions for filter
  const availableRegions = [...new Set(locations.map(location => location.region))];

  // Get icon for species
  const getIconForSpecies = (species) => {
    switch(species) {
      case 'Cattle':
        return createCustomIcon(colors.secondary);
      case 'Sheep':
        return createCustomIcon(colors.primary);
      case 'Pigs':
        return createCustomIcon(colors.warning);
      case 'Poultry':
        return createCustomIcon(colors.error);
      default:
        return createCustomIcon(colors.textMedium);
    }
  };

  return (
    <div className="map-container">
      <h2 className="section-title">AHDB eFoodChain Map</h2>
      
      <div className="filter-section">
        <div className="filter-header">
          <span className="filter-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.5 2H1.5L6.5 8.032V12.5L9.5 14V8.032L14.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <h3 className="filter-title">Filter Locations</h3>
        </div>
        
        <div className="filter-controls">
          <LocationFilter 
            title="Filter by Species"
            options={availableSpecies}
            selectedValues={activeFilters.species}
            onChange={(values) => handleFilterChange('species', values)}
          />
          
          <LocationFilter 
            title="Filter by Region"
            options={availableRegions}
            selectedValues={activeFilters.regions}
            onChange={(values) => handleFilterChange('regions', values)}
          />
        </div>
      </div>
      
      <div className="map-view-section">
        <div className="map-wrapper">
          {loading && (
            <div className="map-loading">
              <div className="spinner"></div>
              <p>Loading map...</p>
            </div>
          )}
          
          <MapContainer 
            ref={mapRef}
            center={defaultCenter} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
            whenReady={handleMapLoaded}
            className={loading ? 'map-loading-state' : ''}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {filteredLocations().map(location => (
              <Marker
                key={location.id}
                position={[location.lat, location.lng]}
                icon={getIconForSpecies(location.species)}
              >
                <Popup className="custom-popup">
                  <div className="marker-info">
                    <h3 className="location-name">{location.tradingName}</h3>
                    <div className="info-row">
                      <span className="info-label">Address:</span>
                      <span className="info-value">{location.address}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Species:</span>
                      <span className="info-value">
                        <span className="species-badge" style={{ backgroundColor: getSpeciesColor(location.species) }}>
                          {location.species}
                        </span>
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">App Number:</span>
                      <span className="info-value">{location.appNumber}</span>
                    </div>
                    {location.additionalInfo && (
                      <div className="additional-info">
                        {location.additionalInfo}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            
            <MapController 
              filteredLocations={filteredLocations()} 
              center={defaultCenter} 
            />
          </MapContainer>
        </div>
        
        <div className="map-legend">
          <h3 className="legend-title">Map Legend</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: colors.secondary }}></span>
              <span className="legend-label">Cattle</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: colors.primary }}></span>
              <span className="legend-label">Sheep</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: colors.warning }}></span>
              <span className="legend-label">Pigs</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: colors.error }}></span>
              <span className="legend-label">Poultry</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: colors.textMedium }}></span>
              <span className="legend-label">Other</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get species color
function getSpeciesColor(species) {
  switch(species) {
    case 'Cattle': return colors.secondary;
    case 'Sheep': return colors.primary;
    case 'Pigs': return colors.warning;
    case 'Poultry': return colors.error;
    default: return colors.textMedium;
  }
}

export default Map;
