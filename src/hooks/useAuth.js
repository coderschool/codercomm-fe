import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Hook to access authentication context
 * @returns {Object} Auth context value containing:
 * - isAuthenticated: Boolean indicating if user is logged in
 * - isInitialized: Boolean indicating if auth is initialized
 * - user: Current user object or null
 * - login: Function to log in
 * - register: Function to register
 * - logout: Function to log out
 * - isLoggingIn: Boolean indicating if login is in progress
 * - isRegistering: Boolean indicating if registration is in progress
 * - isLoggingOut: Boolean indicating if logout is in progress
 */
const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;