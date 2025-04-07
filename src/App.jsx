import React, { useEffect } from "react";
import { Toaster } from "sonner"; // For toast notifications
import Router from "./routes"; // Import the router configuration
import { useAppStore } from "@/lib/store"; // Import the store hook directly
// import LoadingScreen from "@/components/LoadingScreen"; // No longer needed here

/**
 * Main App component:
 * - Initializes authentication on mount.
 * - Renders the main Router.
 * - Includes the Toaster component for notifications.
 */
function App() {
  // Get the initialization action directly from the store hook
  // We no longer need the initialization status here
  const initializeAuth = useAppStore(state => state.initializeAuth);

  // Run the initializeAuth action only once when the component mounts
  useEffect(() => {
    console.log("App Mounted: Initializing Auth...");
    initializeAuth();
  }, [initializeAuth]); // Dependency array ensures this runs only once


  // Render the Router and Toaster immediately
  return (
    <>
      <Router />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}

export default App;
