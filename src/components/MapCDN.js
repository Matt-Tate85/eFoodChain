// src/components/MapCDN.js - Fixed ESLint error
import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';

// We'll load Leaflet via CDN instead of npm
const MapCDN = () => {
  const [isLoading, setIsLoading] = useState(true);
  // We are using mapInitialized in the useEffect for filtering
  const [mapInitialized, setMapInitialized] = useState(false);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });
  const [activeFilters, setActiveFilters] = useState({
    species: [],
    establishmentTypes: [],
    geographicAuthorities: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersLayerRef = useRef(null);
  
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
  const postcodeCache = useRef(new Map());
  
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
    
    // Add some basic styles
    const style = document.createElement('style');
    style.innerHTML = `
      .map-container {
        padding: 20px;
      }
      .map-wrapper {
        height: 600px;
        width: 100%;
        position: relative;
      }
      .map-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #0090d4;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .filter-section {
        margin-bottom: 20px;
      }
      .filter-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      .filter-title {
        margin: 0 0 0 10px;
      }
      .custom-icon {
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.4);
      }
      .map-legend {
        margin-top: 20px;
      }
      .legend-title {
        margin-bottom: 10px;
      }
      .legend-items {
        display: flex;
        flex-wrap: wrap;
      }
      .legend-item {
        display: flex;
        align-items: center;
        margin-right: 20px;
        margin-bottom: 10px;
      }
      .legend-color {
        width: 20px;
        height: 20px;
        margin-right: 5px;
        border-radius: 3px;
      }
      .filter-buttons {
        margin: 10px 0;
      }
      .filter-buttons button {
        margin-right: 10px;
        padding: 8px 15px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
      }
      .filter-buttons button.active {
        background: #0090d4;
        color: white;
        border-color: #0074a9;
      }
      .filter-summary {
        margin-top: 10px;
        font-weight: bold;
      }
      .map-error {
        background: #ffeeee;
        border: 1px solid #ffcccc;
        padding: 20px;
        border-radius: 4px;
        margin: 20px 0;
      }
      .map-error button {
        padding: 8px 15px;
        background: #0090d4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup on unmount
    return () => {
      if (document.head.contains(linkEl)) document.head.removeChild(linkEl);
      if (document.body.contains(scriptEl)) document.body.removeChild(scriptEl);
      if (document.head.contains(style)) document.head.removeChild(style);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }
    };
  }, []);
  
  // Initialize map once Leaflet is loaded
  const initializeMap = () => {
    if (!mapRef.current) return;
    
    const L = window.L; // Get Leaflet from global window
    
    // Create map
    const map = L.map(mapRef.current).setView(UK_CENTER, 6);
    leafletMapRef.current = map;
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Create a layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    
    setMapInitialized(true);
    
    // Now start loading data
    fetchCSVData();
  };
  
  // Create a custom icon for species
  const createCustomIcon = (color) => {
    const L = window.L;
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
  
  // Geocode a UK postcode to latitude/longitude coordinates
  const geocodePostcode = async (postcode) => {
    if (!postcode) return null;
    
    // Normalize postcode
    const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
    
    // Check cache first
    if (postcodeCache.current.has(normalizedPostcode)) {
      return postcodeCache.current.get(normalizedPostcode);
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
        postcodeCache.current.set(normalizedPostcode, result);
        return result;
      }
      
      return null;
    } catch (error) {
      console.error(`Error geocoding postcode ${postcode}:`, error);
      return null;
    }
  };
  
  // Batch geocode multiple postcodes
  const batchGeocodePostcodes = async (postcodes) => {
    // Handle empty input
    if (!postcodes || postcodes.length === 0) {
      return new Map();
    }
    
    // Remove duplicates and empty values
    const uniquePostcodes = [...new Set(postcodes.filter(Boolean))];
    
    // Filter out postcodes we already have in cache
    const postcodesToFetch = uniquePostcodes.filter(
      postcode => !postcodeCache.current.has(postcode.replace(/\s+/g, '').toUpperCase())
    );
    
    if (postcodesToFetch.length === 0) {
      // All postcodes are in cache, return cached results
      const results = new Map();
      uniquePostcodes.forEach(postcode => {
        const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
        if (postcodeCache.current.has(normalizedPostcode)) {
          results.set(postcode, postcodeCache.current.get(normalizedPostcode));
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
              postcodeCache.current.set(normalizedPostcode, coordinates);
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
        if (postcodeCache.current.has(normalizedPostcode)) {
          results.set(postcode, postcodeCache.current.get(normalizedPostcode));
        }
      }
    });
    
    return results;
  };

  // Fetch CSV data
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
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error fetching CSV:', error);
      setError('Failed to fetch CSV data: ' + error.message);
      setIsLoading(false);
    }
  };
  
  // Process location data from CSV
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
      updateMapMarkers(processedLocations);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error processing location data:', error);
      setError('Failed to process location data: ' + error.message);
      setIsLoading(false);
    }
  };
  
  // Update markers on the map
  const updateMapMarkers = (locations) => {
    if (!leafletMapRef.current || !markersLayerRef.current) return;
    
    const L = window.L;
    const map = leafletMapRef.current;
    const markersLayer = markersLayerRef.current;
    
    // Clear existing markers
    markersLayer.clearLayers();
    
    // Add new markers
    locations.forEach(location => {
      const icon = createCustomIcon(speciesColors[location.primarySpecies] || colors.textMedium);
      
      const marker = L.marker([location.lat, location.lng], { icon })
        .bindPopup(`
          <div class="marker-info">
            <h3>${location.tradingName}</h3>
            <div><strong>Address:</strong> ${location.address}</div>
            <div><strong>App Number:</strong> ${location.appNumber}</div>
            <div><strong>Species:</strong> ${location.allSpecies.join(', ')}</div>
            ${location.establishmentTypes.length > 0 ? 
              `<div><strong>Types:</strong> ${location.establishmentTypes.join(', ')}</div>` : ''}
            ${location.geographicAuthority ? 
              `<div><strong>Authority:</strong> ${location.geographicAuthority}</div>` : ''}
          </div>
        `);
      
      markersLayer.addLayer(marker);
    });
    
    // If we have markers, fit the map to them
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(location => [location.lat, location.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };
  
  // Filter locations
  const filterLocations = () => {
    if (!locations.length) return [];
    
    if (!activeFilters.species.length && 
        !activeFilters.establishmentTypes.length && 
        !activeFilters.geographicAuthorities.length) {
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
  };
  
  // Handle filter change for species
  const handleSpeciesFilter = (species) => {
    setActiveFilters(prev => {
      const isActive = prev.species.includes(species);
      const updatedSpecies = isActive
        ? prev.species.filter(s => s !== species)
        : [...prev.species, species];
      
      return { ...prev, species: updatedSpecies };
    });
  };
  
  // Apply filters and update map
  useEffect(() => {
    // We ARE using mapInitialized here, so it's not unused
    if (mapInitialized && locations.length > 0) {
      const filteredLocations = filterLocations();
      updateMapMarkers(filteredLocations);
    }
  }, [activeFilters, locations, mapInitialized]);
  
  // Loading message
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 2H1.5L6.5 8.032V12.5L9.5 14V8.032L14.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="filter-title">Filter Locations</h3>
        </div>
        
        <div className="filter-buttons">
          {Object.keys(speciesColors).map(species => (
            <button 
              key={species}
              className={activeFilters.species.includes(species) ? 'active' : ''}
              onClick={() => handleSpeciesFilter(species)}
            >
              {species}
            </button>
          ))}
        </div>
        
        <div className="filter-summary">
          <span className="result-count">{filterLocations().length} locations found</span>
        </div>
      </div>
      
      <div className="map-wrapper">
        {isLoading && (
          <div className="map-loading">
            <div className="spinner"></div>
            <p>{getLoadingMessage()}</p>
          </div>
        )}
        
        <div ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
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
  );
};

export default MapCDN;
