import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';

// Import Tailwind CSS
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

// Function to render the app
const renderApp = () => {
  root.render(
    <React.StrictMode>
      <HelmetProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
};


// Start mock server conditionally OR render app directly
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  // Dynamically import the mock server setup only when needed
  console.log('Attempting to start mock API server...');
  import('./mockApi/server').then(({ mockServer }) => {
    try {
      mockServer({ environment: 'development' });
      console.log('🔶 Mock API Server Started (Development Mode)');
      renderApp(); // Render the app *after* server starts
    } catch (error) {
       console.error("Error initializing mock server:", error);
       // Optionally render an error message or a minimal app state
       root.render(<div>Failed to initialize mock server.</div>);
    }
  }).catch(error => {
    console.error("Failed to dynamically import mock server:", error);
    // Optionally render an error message
     root.render(<div>Failed to load mock server module.</div>);
  });
} else {
   if (import.meta.env.VITE_API_URL) {
    console.log(` Bypassing mock server. Using real API at: ${import.meta.env.VITE_API_URL}`);
   } else {
     console.log(' Bypassing mock server (Production Mode or VITE_API_URL not set)');
   }
  renderApp(); // Render immediately if not using mock server
}