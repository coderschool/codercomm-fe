import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';

// Import Tailwind CSS
import './index.css';

// Start mock server conditionally (only in development and if no VITE_API_URL)
// import.meta.env.DEV is true during `npm run dev`
// import.meta.env.VITE_API_URL would be set in a .env file for a real API
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  // Dynamically import the mock server setup only when needed
  import('./mockApi/server').then(({ mockServer }) => {
    mockServer({ environment: 'development' });
    console.log('🔶 Mock API Server Started (Development Mode)');
  }).catch(error => {
    console.error("Failed to start mock server:", error);
  });
} else if (import.meta.env.VITE_API_URL) {
  console.log(` Bypassing mock server. Using real API at: ${import.meta.env.VITE_API_URL}`);
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);