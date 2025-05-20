// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorker';

// React 18 approach using createRoot
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
