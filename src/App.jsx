import React, { useEffect } from "react";
import { Toaster } from "sonner";
import Router from "./routes";
import useStore from "@/lib/store";
import LoadingScreen from "@/components/LoadingScreen";

function App() {
  const { initializeAuth, isInitialized } = useStore(state => ({
    initializeAuth: state.initializeAuth,
    isInitialized: state.isInitialized
  }));

  useEffect(() => {
    // Initialize authentication on app mount
    initializeAuth();
  }, [initializeAuth]);

  // Show loading screen while auth is initializing
  if (!isInitialized) {
    return <LoadingScreen message="Initializing application..." />;
  }

  return (
    <>
      <Router />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
