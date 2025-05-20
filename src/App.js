import React from 'react';
import './styles/global.css';
import MapCDN from './components/MapCDN';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AHDB eFoodChain Map</h1>
      </header>
      <main className="App-main">
        <MapCDN />
      </main>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Agriculture and Horticulture Development Board</p>
      </footer>
    </div>
  );
}

export default App;
