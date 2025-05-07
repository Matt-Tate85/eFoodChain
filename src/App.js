import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 style={{color: '#0090d4'}}>AHDB eFoodChainMap</h1>
      </header>
      <main className="app-main">
        <div style={{padding: '20px', textAlign: 'center'}}>
          <h2 style={{color: '#1f4350'}}>Food Chain Map</h2>
          <p>Map visualization coming soon!</p>
        </div>
      </main>
      <footer className="app-footer" style={{
        backgroundColor: '#1f4350',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginTop: '20px'
      }}>
        <p>© {new Date().getFullYear()} Agriculture and Horticulture Development Board</p>
      </footer>
    </div>
  );
}

export default App;
