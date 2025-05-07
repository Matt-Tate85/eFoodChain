import React, { useState, useRef, useEffect } from 'react';
import '../styles/components/LocationFilter.css';

const LocationFilter = ({ title, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleFilter = (e) => {
    e.stopPropagation();
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

  const clearFilter = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={`location-filter ${isOpen ? 'is-open' : ''}`} ref={dropdownRef}>
      <button 
        className="filter-button" 
        onClick={toggleFilter}
        aria-expanded={isOpen}
        aria-controls={`dropdown-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span className="filter-button-text">{title}</span>
        <span className="filter-count">{selectedValues.length > 0 ? selectedValues.length : ''}</span>
        <svg className="filter-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div 
        className="filter-dropdown" 
        id={`dropdown-${title.toLowerCase().replace(/\s+/g, '-')}`}
        style={{display: isOpen ? 'block' : 'none'}}
      >
        {selectedValues.length > 0 && (
          <div className="filter-actions">
            <button className="clear-button" onClick={clearFilter}>
              Clear all
            </button>
          </div>
        )}
        
        <div className="filter-options">
          {options && options.length > 0 ? (
            options.map(option => (
              <label key={option} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => handleOptionChange(option)}
                  className="filter-checkbox"
                />
                <span className="filter-label">{option}</span>
              </label>
            ))
          ) : (
            <div className="empty-message">No options available</div>
          )}
        </div>
      </div>
      
      {!isOpen && selectedValues.length > 0 && (
        <div className="selected-summary">
          {selectedValues.length} selected
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
