// src/components/Map.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';
import LocationFilter from './LocationFilter';
import '../styles/components/Map.css';

// Import the helper functions from leafletSetup.js
import { createMarkerIcon, createCustomDivIcon } from './leafletSetup';

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

// UK center point for fallback
const UK_CENTER = [54.7023545, -3.2765753];

// Postcode Cache
const postcodeCache = new Map();

/**
 * Geocode a UK postcode to latitude/longitude coordinates
 * @param {string} postcode - UK postcode 
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
const geocodePostcode = async (postcode) => {
  if (!postcode) return null;
  
  // Normalize postcode
  const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
  
  // Check cache first
  if (postcodeCache.has(normalizedPostcode)) {
    return postcodeCache.get(normalizedPostcode);
  }
  
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(normalizedPostcode)}`);
    
    if (!response.ok) {
      console.warn(`Geocoding failed for postcode: ${postcode} with status: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 200 && data.result) {
      const result = {
        lat: data.result.latitude,
        lng: data.result.longitude
      };
      
      // Add to cache
      postcodeCache.set(normalizedPostcode, result);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error(`Error geocoding postcode ${postcode}:`, error);
    return null;
  }
};

/**
 * Batch geocode multiple postcodes
 * @param {string[]} postcodes - Array of postcodes
 * @returns {Promise<Map<string, {lat: number, lng: number}>>}
 */
const batchGeocodePostcodes = async (postcodes) => {
  // Handle empty input
  if (!postcodes || postcodes.length === 0) {
    return new Map();
  }
  
  // Remove duplicates and empty values
  const uniquePostcodes = [...new Set(postcodes.filter(Boolean))];
  
  // Filter out postcodes we already have in cache
  const postcodesToFetch = uniquePostcodes.filter(
    postcode => !postcodeCache.has(postcode.replace(/\s+/g, '').toUpperCase())
  );
  
  if (postcodesToFetch.length === 0) {
    // All postcodes are in cache, return cached results
    const results = new Map();
    uniquePostcodes.forEach(postcode => {
      const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      if (postcodeCache.has(normalizedPostcode)) {
        results.set(postcode, postcodeCache.get(normalizedPostcode));
      }
    });
    return results;
  }
  
  // Split into chunks of 100 (API limit)
  const chunks = [];
  for (let i = 0; i < postcodesToFetch.length; i += 100) {
    chunks.push(postcodesToFetch.slice(i, i + 100));
  }
  
  const results = new Map();
  
  // Process each chunk
  for (const chunk of chunks) {
    try {
      const response = await fetch('https://api.postcodes.io/postcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postcodes: chunk })
      });
      
      if (!response.ok) {
        console.warn(`Bulk geocoding failed with status: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.status === 200 && data.result) {
        data.result.forEach(item => {
          if (item.result) {
            const coordinates = {
              lat: item.result.latitude,
              lng: item.result.longitude
            };
            
            // Add to results and cache
            const normalizedPostcode = item.query.replace(/\s+/g, '').toUpperCase();
            results.set(item.query, coordinates);
            postcodeCache.set(normalizedPostcode, coordinates);
          }
        });
      }
    } catch (error) {
      console.error('Error in bulk geocoding:', error);
    }
  }
  
  // Add cached results for postcodes not in this batch
  uniquePostcodes.forEach(postcode => {
    if (!results.has(postcode)) {
      const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      if (postcodeCache.has(normalizedPostcode)) {
        results.set(postcode, postcodeCache.get(normalizedPostcode));
      }
    }
  });
  
  return results;
};

// Map Filter Control Component - MODIFIED to fix bounds issue
function MapController({ filteredLocations, center }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    if (filteredLocations && filteredLocations.length > 0) {
      try {
        // Create bounds from array of points
        const points = filteredLocations.map(location => [location.lat, location.lng]);
        
        // Check if points are valid
        const validPoints = points.filter(point => 
          Array.isArray(point) && 
          point.length === 2 && 
          !isNaN(point[0]) && 
          !isNaN(point[1])
        );
        
        if (validPoints.length > 0) {
          // Create a bounds object
          const bounds = validPoints.reduce((bounds, point) => {
            return bounds.extend(point);
          }, map.getBounds());
          
          // Fit the map to these bounds
          map.fitBounds(bounds, { padding: [50, 50] });
        } else {
          map.setView(center, 6);
        }
      } catch (error) {
        console.error('Error fitting bounds:', error);
        // Fallback to center view
        map.setView(center, 6);
      }
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
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });
  const [activeFilters, setActiveFilters] = useState({
    species: [],
    establishmentTypes: [],
    geographicAuthorities: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [error, setError] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef(null);

  // Add the CSS for the map container and other elements
  useEffect(() => {
    // Only add if it doesn't exist already
    if (!document.getElementById('map-loading-styles')) {
      const style = document.createElement('style');
      style.id = 'map-loading-styles';
      style.innerHTML = `
        .map-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.8);
          z-index: 1000;
        }
        .spinner {
          border: 5px solid #f3f3f3;
          border-top: 5px solid #0090d4;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .map-wrapper {
          position: relative;
          height: 600px;
          width: 100%;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Handle on load callback
  const handleMapLoaded = () => {
    console.log('Map is loaded and ready');
    setMapInitialized(true);
    
    if (onMapLoaded) {
      setTimeout(() => {
        setLoading(false);
        onMapLoaded();
      }, 500); // Small delay to ensure map tiles are loaded
    } else {
      setLoading(false);
    }
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

  // Process location data with postcodes
  const processLocationData = async (csvData) => {
    try {
      // Ensure csvData is valid
      if (!csvData || !Array.isArray(csvData)) {
        throw new Error('Invalid CSV data structure');
      }
      
      console.log('Processing CSV data:', csvData.length, 'rows');
      
      // Extract records with postcodes or coordinates
      const validRecords = csvData
        .filter(row => row && (row.Postcode || (row.X && row.Y)))
        .map((row, index) => ({
          ...row,
          id: row.AppNo || `location-${index}`,
          tradingName: row.TradingName || 'Unnamed Location',
          address: formatAddress(row),
          primarySpecies: getPrimarySpecies(row),
          allSpecies: getAllSpecies(row),
          establishmentTypes: getEstablishmentTypes(row),
          geographicAuthority: row.GeographicLocalAuthority,
          country: row.Country
        }));
      
      console.log('Valid records found:', validRecords.length);
      setGeocodingProgress({ current: 0, total: validRecords.length });
      
      // Extract postcodes for geocoding
      const postcodes = validRecords
        .filter(row => row.Postcode)
        .map(row => row.Postcode);
      
      console.log('Postcodes to geocode:', postcodes.length);
      
      // Batch geocode all postcodes
      const geocodedPostcodes = await batchGeocodePostcodes(postcodes);
      console.log('Geocoded postcodes:', geocodedPostcodes.size);
      
      // Process in batches to avoid UI blocking
      const batchSize = 100;
      const totalBatches = Math.ceil(validRecords.length / batchSize);
      
      const processedLocations = [];
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, validRecords.length);
        const batch = validRecords.slice(startIndex, endIndex);
        
        const batchPromises = batch.map(async (record) => {
          let lat, lng;
          
          // Try postcode first
          if (record.Postcode && geocodedPostcodes.has(record.Postcode)) {
            const geocoded = geocodedPostcodes.get(record.Postcode);
            lat = geocoded.lat;
            lng = geocoded.lng;
          } 
          // Fallback: try to see if X/Y are already lat/lng
          else if (record.X && record.Y) {
            const x = parseFloat(record.X);
            const y = parseFloat(record.Y);
            if (x >= -10 && x <= 2 && y >= 49 && y <= 61) {
              lat = y;
              lng = x;
            } else {
              // Last resort: use UK center
              lat = UK_CENTER[0];
              lng = UK_CENTER[1];
            }
          } else {
            // Default fallback
            lat = UK_CENTER[0];
            lng = UK_CENTER[1];
          }
          
          return {
            ...record,
            lat,
            lng
          };
        });
        
        const batchResults = await Promise.all(batchPromises);
        processedLocations.push(...batchResults);
        
        setGeocodingProgress({
          current: Math.min(endIndex, validRecords.length),
          total: validRecords.length
        });
        
        // Small delay to allow UI updates
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      console.log('Processed locations:', processedLocations.length);
      setLocations(processedLocations);
      setLoading(false);
      
    } catch (error) {
      console.error('Error processing location data:', error);
      setError('Failed to process location data: ' + error.message);
      setLoading(false);
    }
  };

  // Fetch locations data from CSV
  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        console.log('Fetching CSV data...');
        const response = await fetch('ApprovedEstablishments.csv');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.text();
        console.log('CSV data received, length:', csvText.length);
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('Papa parse complete, rows:', results.data.length);
            processLocationData(results.data);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setError('Failed to parse CSV data: ' + error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching CSV:', error);
        setError('Failed to fetch CSV data: ' + error.message);
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

  // Get icon for species - uses createCustomDivIcon from leafletSetup.js
  const getIconForSpecies = (species) => {
    return createCustomDivIcon(speciesColors[species] || colors.textMedium);
  };

  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const getLoadingMessage = () => {
    if (geocodingProgress.current > 0 && geocodingProgress.total > 0) {
      const percentage = Math.round((geocodingProgress.current / geocodingProgress.total) * 100);
      return `Geocoding locations: ${percentage}% (${geocodingProgress.current}/${geocodingProgress.total})`;
    }
    return 'Loading map...';
  };

  // If there was an error loading the data
  if (error) {
    return (
      <div className="map-container">
        <h2 className="section-title">AHDB eFoodChain Map</h2>
        <div className="map-error">
          <h3>Error Loading Map</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

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
              <p>{getLoadingMessage()}</p>
            </div>
          )}
          
          {/* KEY CHANGE: Use key="map" to force re-rendering if needed */}
          <MapContainer 
            key="map"
            ref={mapRef}
            center={UK_CENTER} 
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
            
            {/* KEY CHANGE: Only render markers after map is initialized */}
            {mapInitialized && filteredLocations().map(location => (
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
            
            {/* KEY CHANGE: Only add MapController after map is initialized */}
            {mapInitialized && (
              <MapController 
                filteredLocations={filteredLocations()} 
                center={UK_CENTER} 
              />
            )}
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
