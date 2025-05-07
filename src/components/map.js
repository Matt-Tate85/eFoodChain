import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import LocationFilter from './LocationFilter';
import '../styles/components/Map.css';
import sampleLocations from '../data/locations'; // Temporary - replace with API call

// Map container style
const containerStyle = {
  width: '100%',
  height: '70vh'
};

// UK center point (approximate)
const defaultCenter = {
  lat: 54.7023545,
  lng: -3.2765753
};

// Map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true
};

const Map = () => {
  const [map, setMap] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    species: [],
    regions: []
  });
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(6);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    // You can include additional libraries if needed
    // libraries: ['places']
  });

  // Fetch locations data
  useEffect(() => {
    // In a real app, fetch from API
    // Example:
    // const fetchLocations = async () => {
    //   try {
    //     const response = await fetch('https://api.ahdb.org.uk/efoodchainmap');
    //     const data = await response.json();
    //     setLocations(data);
    //   } catch (error) {
    //     console.error('Error fetching locations:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchLocations();

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

  // Handle map load
  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Handle map unload
  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle marker click
  const handleMarkerClick = (location) => {
    setSelectedMarker(location);
  };

  // Handle info window close
  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

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

  // Handle map error
  if (loadError) {
    return <div className="map-error">Error loading maps</div>;
  }

  // Show loading indicator
  if (!isLoaded || loading) {
    return <div className="loading">Loading map...</div>;
  }

  return (
    <div className="map-container">
      <div className="container">
        <h2>AHDB Food Chain Map</h2>
        
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
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={mapZoom}
            options={mapOptions}
            onLoad={onMapLoad}
            onUnmount={onMapUnmount}
          >
            {filteredLocations().map(location => (
              <Marker
                key={location.id}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => handleMarkerClick(location)}
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                  fillColor: location.species === 'Cattle' ? '#6da32f' : 
                             location.species === 'Sheep' ? '#0090d4' : 
                             location.species === 'Pigs' ? '#ed7013' : 
                             location.species === 'Poultry' ? '#7b3010' : 
                             '#575756',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 1,
                  scale: 2,
                  anchor: { x: 12, y: 22 },
                }}
              />
            ))}
            
            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="marker-info">
                  <h3>{selectedMarker.tradingName}</h3>
                  <p><strong>Address:</strong> {selectedMarker.address}</p>
                  <p><strong>Species:</strong> {selectedMarker.species}</p>
                  <p><strong>App Number:</strong> {selectedMarker.appNumber}</p>
                  {selectedMarker.additionalInfo && (
                    <p>{selectedMarker.additionalInfo}</p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
        
        <div className="map-legend">
          <h3>Map Legend</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#6da32f' }}></span>
              <span>Cattle</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#0090d4' }}></span>
              <span>Sheep</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ed7013' }}></span>
              <span>Pigs</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#7b3010' }}></span>
              <span>Poultry</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#575756' }}></span>
              <span>Other</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
