import React, { useState } from 'react';
import '../styles/components/LocationFilter.css';

const LocationFilter = ({ title, options, selectedValues, onChange }) => {
  // Create a unique component ID for this specific filter instance
  const [uniqueId] = useState(`filter-${Math.random().toString(36).substring(2, 9)}`);
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionChange = (value) => {
    let newValues;
    
    if (selectedValues.includes(value)) {
      newValues = selectedValues.filter(v => v !== value);
    } else {
      newValues = [...selectedValues, value];
    }
    
    onChange(newValues);
  };

  const clearFilter = () => {
    onChange([]);
  };

  return (
    <div className="location-filter" id={uniqueId}>
      <div className="filter-header" onClick={toggleFilter}>
        <h3>{title}</h3>
        <span className={`filter-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      
      {isOpen && (
        <div className="filter-options">
          {options && options.length > 0 ? (
            <>
              {options.map(option => (
                <div key={`${uniqueId}-${option}`} className="filter-option">
                  <label className="checkbox-container">
                    {option}
                    <input
                      id={`${uniqueId}-${option}`}
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={() => handleOptionChange(option)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>
              ))}
              
              {selectedValues.length > 0 && (
                <button className="clear-filter" onClick={(e) => {
                  e.stopPropagation();
                  clearFilter();
                }}>
                  Clear {title.toLowerCase()}
                </button>
              )}
            </>
          ) : (
            <div className="no-options">No options available</div>
          )}
        </div>
      )}
      
      {!isOpen && selectedValues.length > 0 && (
        <div className="selected-filters">
          <span>Selected: {selectedValues.join(', ')}</span>
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
