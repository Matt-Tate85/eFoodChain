// Add a simple marker using direct icon creation (bypassing L.Icon.Default)
          const customIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            iconSize: [25, 41], 
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
          });
          
          L.marker([51.505, -0.09], { icon: customIcon })
            .addTo(map)
            .bindPopup('A simple marker in London')
            .openPopup();
          
          setMapLoaded(true);
        }
      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };
    
    loadLeaflet();
    
    // Add some CSS for the map container
    const style = document.createElement('style');
    style.textContent = `
      #map {
        height: 600px;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Clean up - we'd remove the map here if needed
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="simple-map-container">
      <h2>AHDB eFoodChain Map</h2>
      {!mapLoaded && <div>Loading map...</div>}
      <div id="map"></div>
    </div>
  );
};

export default SimpleMap;
