import React from "react";
import { Navigate, useLocation } from "react-router";

import LoadingCircle from "@/components/LoadingCircle";
import { useAuth } from "./authSlice";
/**
 * Route Guard: AuthRequire
 * - Renders children (e.g., Home page) only if the user IS authenticated.
 * - Redirects unauthenticated users to the login page, remembering where they came from.
 * - Shows a loading screen while authentication is being initially checked.
 */
function AuthRequire({ children }) {
  // Get auth state from Zustand store
  const { isLoading, currentUser } = useAuth();
  const location = useLocation(); // Get current location object

  // Show loading screen while the initial auth check is in progress
  if (isLoading) {
    return <LoadingCircle />;
  }

  // If loading is finished and user is not authenticated, redirect them to the login page
  if (!currentUser) {
    // Check if currentUser object exists
    // `replace`: Replace the current entry in history stack, so back button works correctly.
    // `state={{ from: location }}`: Pass the current location to the login page,
    // so it can redirect back after successful login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If loading is finished and authenticated, render the intended protected page
  return children;
}

export default AuthRequire;
