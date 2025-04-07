import { jwtDecode } from 'jwt-decode';

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
  if (accessToken.startsWith('mock-token-for-')) {
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