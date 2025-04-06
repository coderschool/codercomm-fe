import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '@/hooks/useAuth';
import LoadingScreen from '@/components/LoadingScreen';

/**
 * Route Guard: GuestRoute
 * - Renders children (e.g., Login page) only if the user is NOT authenticated.
 * - Redirects authenticated users to the home page ('/').
 * - Shows a loading screen while authentication is being initialized.
 */
function GuestRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  
  // Show loading screen until authentication status is determined
  if (!isInitialized) {
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  // If user is authenticated, redirect them away from guest pages (e.g., login)
  if (isAuthenticated) {
    // Redirect to the home page, replacing the current history entry
    return <Navigate to="/" replace />;
  }
  
  // If initialized and not authenticated, render the intended guest page
  return children;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GuestRoute;