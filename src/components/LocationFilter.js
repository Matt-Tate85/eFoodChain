import React, { useState, useRef, useEffect } from 'react';
import '../styles/components/LocationFilter.css';

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
        style={{ 
          borderColor: isOpen ? colors.primary : colors.border,
          boxShadow: isOpen ? `0 0 0 3px rgba(0, 144, 212, 0.15)` : 'none'
        }}
      >
        <span className="filter-button-text">{title}</span>
        {selectedValues.length > 0 && (
          <span className="filter-count" style={{ backgroundColor: colors.primary }}>
            {selectedValues.length}
          </span>
        )}
        <svg 
          className="filter-arrow" 
          width="12" 
          height="8" 
          viewBox="0 0 12 8" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: isOpen ? colors.primary : colors.textMedium }}
        >
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
            <button 
              className="clear-button" 
              onClick={clearFilter}
              style={{ color: colors.primary }}
            >
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
                <span 
                  className="custom-checkbox"
                  style={{ 
                    borderColor: selectedValues.includes(option) ? colors.primary : colors.border,
                    backgroundColor: selectedValues.includes(option) ? colors.primary : 'white' 
                  }}
                >
                  {selectedValues.includes(option) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className="filter-label">{option}</span>
              </label>
            ))
          ) : (
            <div className="empty-message">No options available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationFilter;
