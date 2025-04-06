import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';
import useAuth from "@/hooks/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Route Guard: AuthRequire
 * - Renders children (e.g., Home page) only if the user IS authenticated.
 * - Redirects unauthenticated users to the login page, remembering where they came from.
 * - Shows a loading screen while authentication is being initialized.
 */
function AuthRequire({ children }) {
  const { isInitialized, isAuthenticated } = useAuth();
  const location = useLocation(); // Get current location object

  // Show loading screen until authentication status is determined
  if (!isInitialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // If user is not authenticated, redirect them to the login page
  if (!isAuthenticated) {
    // `replace`: Replace the current entry in history stack, so back button works correctly.
    // `state={{ from: location }}`: Pass the current location to the login page,
    // so it can redirect back after successful login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If initialized and authenticated, render the intended protected page
  return children;
}

AuthRequire.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthRequire;
