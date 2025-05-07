import React from 'react';
import '../styles/components/MarkerInfo.css';

const MarkerInfo = ({ location }) => {
  if (!location) return null;

  return (
    <div className="marker-info-container">
      <h3>{location.tradingName}</h3>
      
      <div className="info-section">
        <p><strong>Address:</strong> {location.address}</p>
        <p><strong>Species:</strong> {location.species}</p>
        <p><strong>App Number:</strong> {location.appNumber}</p>
        <p><strong>Region:</strong> {location.region}</p>
        
        {location.additionalInfo && (
          <p className="additional-info">{location.additionalInfo}</p>
        )}
      </div>
      
      <div className="info-actions">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="directions-link"
        >
          Get Directions
        </a>
      </div>
    </div>
  );
};

export default MarkerInfo;
