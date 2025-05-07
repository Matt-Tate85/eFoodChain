import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LocationFilter from './LocationFilter';
import '../styles/components/Map.css';
import sampleLocations from '../data/locations';

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

// AHDB Colors
const ahdbBlue = "#0090d4";
const ahdbGreen = "#6da32f";
const ahdbText = "#575756";
const credible = "#1f4350";
const neutral = "#dfd5b4";
const balance = "#9db7c2";
const solid = "#7b3010";
const confident = "#ed7013";

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

const Map = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    species: [],
    regions: []
  });

  // Fetch locations data
  useEffect(() => {
    // In a real app, fetch from API
    // Using sample data for now
    setLocations(sampleLocations);
    setLoading(false);
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
        return createCustomIcon(ahdbGreen);
      case 'Sheep':
        return createCustomIcon(ahdbBlue);
      case 'Pigs':
        return createCustomIcon(confident);
      case 'Poultry':
        return createCustomIcon(solid);
      default:
        return createCustomIcon(ahdbText);
    }
  };

  // Show loading indicator
  if (loading) {
    return <div className="loading">Loading map...</div>;
  }

  return (
    <div className="map-container">
      <div className="container">
        <h2>AHDB eFoodchain Map</h2>
        
        <div className="map-filters">
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
        
        <div className="map-wrapper">
          <MapContainer 
            center={defaultCenter} 
            zoom={6} 
            style={{ height: '70vh', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
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
                <Popup>
                  <div className="marker-info">
                    <h3>{location.tradingName}</h3>
                    <p><strong>Address:</strong> {location.address}</p>
                    <p><strong>Species:</strong> {location.species}</p>
                    <p><strong>App Number:</strong> {location.appNumber}</p>
                    {location.additionalInfo && (
                      <p>{location.additionalInfo}</p>
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
          <h3>Map Legend</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: ahdbGreen }}></span>
              <span>Cattle</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: ahdbBlue }}></span>
              <span>Sheep</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: confident }}></span>
              <span>Pigs</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: solid }}></span>
              <span>Poultry</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: ahdbText }}></span>
              <span>Other</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
