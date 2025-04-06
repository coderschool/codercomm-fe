import { jwtDecode } from 'jwt-decode';

/**
 * Check if a JWT access token is still valid (not expired).
 * This is a basic client-side check. The server should always perform its own validation.
 * @param {string | null} accessToken - JWT token to validate.
 * @returns {boolean} - True if the token exists and hasn't expired, false otherwise.
 */
export const isValidToken = (accessToken) => {
  if (!accessToken) return false; // No token, definitely invalid
  
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