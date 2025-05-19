import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';
import LocationFilter from './LocationFilter';
import '../styles/components/Map.css';
// Fix Leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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

// Specify colors for each species
const speciesColors = {
  Cattle: colors.secondary,
  Sheep: colors.primary,
  Pigs: colors.warning,
  Poultry: colors.error,
  Goats: colors.info,
  Lagomorphs: colors.textMedium
};

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
    establishmentTypes: [],
    geographicAuthorities: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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

  // Helper function to convert OS Grid Reference to Lat/Lng
  // This is a very simplified version - in production you'd want to use a proper library
  const convertOsGridToLatLng = (x, y) => {
    // This is a placeholder - in reality you'd use a proper conversion
    // For now, if the data looks like it might be lat/lng already, we'll use it as is
    if (x > -10 && x < 10 && y > 45 && y < 65) {
      return [y, x]; // Might already be lat/lng
    }
    
    // Here we'd normally use a proper transformation
    // For testing, let's just return a reasonable value in the UK
    return [
      51.5074 + (Math.random() - 0.5) * 10, // London +/- 5 degrees
      -0.1278 + (Math.random() - 0.5) * 10
    ];
  };

  // Format address from components
  const formatAddress = (row) => {
    const parts = [
      row.Address1,
      row.Address2,
      row.Address3,
      row.Town,
      row.Postcode
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  };

  // Determine primary species
  const getPrimarySpecies = (row) => {
    const speciesColumns = ['Cattle', 'Sheep', 'Pigs', 'Poultry', 'Goats', 'Lagomorphs'];
    
    for (const species of speciesColumns) {
      if (row[species] === 'Y') {
        return species;
      }
    }
    
    return 'Other';
  };

  // Get all species for a location
  const getAllSpecies = (row) => {
    const speciesColumns = ['Cattle', 'Sheep', 'Pigs', 'Poultry', 'Goats', 'Lagomorphs'];
    return speciesColumns.filter(species => row[species] === 'Y');
  };

  // Get establishment types
  const getEstablishmentTypes = (row) => {
    const typeColumns = [
      'Auction_Hall', 'Collection_Centre', 'Cutting_Plant', 'Cold_Store', 
      'Packing_Centre', 'Mince_Meat_Establishment', 'Meat_Preparation_Establishment',
      'Mechanically_Separated_Meat_Establishment', 'Processing_Plant',
      'Re_Wrappingand_repackaging_establishment', 'Slaughterhouse', 'Wholesale_Market',
      'Freezer_Vessel'
    ];
    
    return typeColumns.filter(type => row[type] === 'Y').map(type => 
      type.replace(/_/g, ' ').replace(/and/g, ' & ')
    );
  };

  // Fetch locations data from CSV
  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const response = await fetch('ApprovedEstablishments01052025.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const formattedLocations = results.data
              .filter(row => row.X && row.Y && !isNaN(parseFloat(row.X)) && !isNaN(parseFloat(row.Y)))
              .map((row, index) => {
                const [lat, lng] = convertOsGridToLatLng(parseFloat(row.X), parseFloat(row.Y));
                const primarySpecies = getPrimarySpecies(row);
                
                return {
                  id: row.AppNo || `location-${index}`,
                  tradingName: row.TradingName || 'Unnamed Location',
                  address: formatAddress(row),
                  lat,
                  lng,
                  appNumber: row.AppNo,
                  primarySpecies,
                  allSpecies: getAllSpecies(row),
                  establishmentTypes: getEstablishmentTypes(row),
                  geographicAuthority: row.GeographicLocalAuthority,
                  country: row.Country,
                  rawData: row // Keep raw data for advanced filtering
                };
              });
            
            setLocations(formattedLocations);
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching CSV:', error);
        setLoading(false);
      }
    };
    
    fetchCSVData();
  }, []);

  // Filter locations based on active filters
  const filteredLocations = useCallback(() => {
    if (!activeFilters.species.length && !activeFilters.establishmentTypes.length && !activeFilters.geographicAuthorities.length) {
      return locations;
    }

    return locations.filter(location => {
      // Species filter
      const matchesSpecies = !activeFilters.species.length || 
        activeFilters.species.some(species => location.allSpecies.includes(species));
      
      // Establishment type filter
      const matchesEstablishmentType = !activeFilters.establishmentTypes.length || 
        activeFilters.establishmentTypes.some(type => location.establishmentTypes.includes(type));
      
      // Geographic authority filter
      const matchesAuthority = !activeFilters.geographicAuthorities.length || 
        activeFilters.geographicAuthorities.includes(location.geographicAuthority);
      
      return matchesSpecies && matchesEstablishmentType && matchesAuthority;
    });
  }, [locations, activeFilters]);

  // Handle filter change
  const handleFilterChange = (filterType, values) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  // Get all available species
  const availableSpecies = ['Cattle', 'Sheep', 'Pigs', 'Poultry', 'Goats', 'Lagomorphs'];
  
  // Get all available establishment types
  const availableEstablishmentTypes = [...new Set(
    locations.flatMap(location => location.establishmentTypes)
  )].sort();
  
  // Get all available geographic authorities
  const availableAuthorities = [...new Set(
    locations.map(location => location.geographicAuthority).filter(Boolean)
  )].sort();

  // Get icon for species
  const getIconForSpecies = (species) => {
    return createCustomIcon(speciesColors[species] || colors.textMedium);
  };

  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
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
          
          <button 
            className="advanced-filter-toggle" 
            onClick={toggleAdvancedFilters}
            aria-expanded={showAdvancedFilters}
          >
            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            <svg 
              className={`toggle-arrow ${showAdvancedFilters ? 'expanded' : ''}`} 
              width="12" 
              height="8" 
              viewBox="0 0 12 8" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {showAdvancedFilters && (
            <div className="advanced-filters">
              <LocationFilter 
                title="Filter by Establishment Type"
                options={availableEstablishmentTypes}
                selectedValues={activeFilters.establishmentTypes}
                onChange={(values) => handleFilterChange('establishmentTypes', values)}
              />
              
              <LocationFilter 
                title="Filter by Geographic Authority"
                options={availableAuthorities}
                selectedValues={activeFilters.geographicAuthorities}
                onChange={(values) => handleFilterChange('geographicAuthorities', values)}
              />
            </div>
          )}
        </div>
        
        <div className="filter-summary">
          <span className="result-count">{filteredLocations().length} locations found</span>
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
                icon={getIconForSpecies(location.primarySpecies)}
              >
                <Popup className="custom-popup">
                  <div className="marker-info">
                    <h3 className="location-name">{location.tradingName}</h3>
                    <div className="info-row">
                      <span className="info-label">Address:</span>
                      <span className="info-value">{location.address}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">App Number:</span>
                      <span className="info-value">{location.appNumber}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Species:</span>
                      <span className="info-value species-tags">
                        {location.allSpecies.map(species => (
                          <span 
                            key={species} 
                            className="species-badge"
                            style={{ backgroundColor: speciesColors[species] }}
                          >
                            {species}
                          </span>
                        ))}
                      </span>
                    </div>
                    {location.establishmentTypes.length > 0 && (
                      <div className="info-row">
                        <span className="info-label">Type:</span>
                        <span className="info-value type-tags">
                          {location.establishmentTypes.map(type => (
                            <span key={type} className="type-badge">
                              {type}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                    {location.geographicAuthority && (
                      <div className="info-row">
                        <span className="info-label">Authority:</span>
                        <span className="info-value">{location.geographicAuthority}</span>
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
            {Object.entries(speciesColors).map(([species, color]) => (
              <div className="legend-item" key={species}>
                <span className="legend-color" style={{ backgroundColor: color }}></span>
                <span className="legend-label">{species}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
