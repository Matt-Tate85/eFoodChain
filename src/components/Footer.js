import React from 'react';
import '../styles/components/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <h3>AHDB eFoodChainMap</h3>
            <p>Agriculture and Horticulture Development Board</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Information</h4>
              <ul>
                <li><a href="https://ahdb.org.uk/privacy-notice" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
                <li><a href="https://ahdb.org.uk/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms & Conditions</a></li>
                <li><a href="https://ahdb.org.uk/cookies" target="_blank" rel="noopener noreferrer">Cookie Policy</a></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:info@ahdb.org.uk">info@ahdb.org.uk</a></li>
                <li><a href="tel:+441247669000">+44 (0) 1247 669 000</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} Agriculture and Horticulture Development Board. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
