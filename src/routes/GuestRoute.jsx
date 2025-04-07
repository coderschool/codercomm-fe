import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
// import useAuth from '@/hooks/useAuth'; // Removed
import { useAppStore } from "@/lib/store"; // Added
import LoadingScreen from '@/components/LoadingScreen';

/**
 * Route Guard: GuestRoute
 * - Renders children (e.g., Login page) only if the user is NOT authenticated.
 * - Redirects authenticated users to the home page ('/').
 * - Shows a loading screen while authentication is being initially checked.
 */
function GuestRoute({ children }) {
  // Get auth state from Zustand store
  const { isLoadingAuth, currentUser } = useAppStore((state) => ({
    isLoadingAuth: state.isLoadingAuth,
    currentUser: state.currentUser,
  }));
  
  // Show loading screen while the initial auth check is in progress
  if (isLoadingAuth) {
    return <LoadingScreen message="Checking authentication..." />;
  }
  
  // If loading is finished and user IS authenticated, redirect them away from guest pages (e.g., login)
  if (currentUser) { // Check if currentUser object exists
    // Redirect to the home page, replacing the current history entry
    return <Navigate to="/" replace />;
  }
  
  // If loading is finished and not authenticated, render the intended guest page
  return children;
}

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GuestRoute;