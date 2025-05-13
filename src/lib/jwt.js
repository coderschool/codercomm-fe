import apiService from "./apiService";

/**
 * Helper function: Set or remove the authentication token in localStorage
 * and update the default Authorization header for apiService.
 * @param {string | null} accessToken - The JWT token or null to clear.
 */
export const setSession = (accessToken) => {
  if (accessToken) {
    // Store token in browser's local storage for persistence
    localStorage.setItem("accessToken", accessToken);
    // Set the token as the default Authorization header for all API requests
    // Need to handle potential initial call before apiService is fully initialized
    if (apiService?.defaults?.headers?.common) {
      apiService.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn("apiService not ready when setting initial session header");
    }
  } else {
    // Remove token from local storage
    localStorage.removeItem("accessToken");
    // Remove the Authorization header from future API requests
    if (apiService?.defaults?.headers?.common) {
      delete apiService.defaults.headers.common.Authorization;
    }
  }
};
