import { jwtDecode } from "jwt-decode";
import apiService from "./apiService";

/**
 * Check if a JWT access token is still valid (not expired).
 * This is a basic client-side check. The server should always perform its own validation.
 * Handles special case for mock tokens used in development.
 * @param {string | null} accessToken - JWT token to validate.
 * @returns {boolean} - True if the token exists and hasn't expired (or is a mock token), false otherwise.
 */
export const isValidToken = (accessToken) => {
  if (!accessToken) return false; // No token, definitely invalid

  // --- Handle Mock Token ---
  // Check if it's our specific mock token format before attempting JWT decode
  if (accessToken.startsWith("token-for-")) {
    // console.log("Token check: Assuming mock token is valid.");
    return true; // Consider mock tokens always valid for the demo
  }

  // --- Handle Real JWT ---
  try {
    // Decode the token to access its payload (claims)
    // The payload contains information like expiration time (`exp`)
    const decoded = jwtDecode(accessToken);

    // Get the current time in seconds (JWT `exp` is in seconds since epoch)
    const currentTime = Date.now() / 1000;

    // Compare the expiration time (`exp`) with the current time
    // If `exp` is in the future, the token is still valid
    return decoded.exp > currentTime;
  } catch (error) {
    // If decoding fails (e.g., invalid token format), consider it invalid
    console.error("Failed to decode JWT:", error);
    return false;
  }
};

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
