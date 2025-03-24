import { jwtDecode } from 'jwt-decode';

export const isValidToken = (accessToken) => {
  if (!accessToken) {
    console.log("Token validation failed: No token provided");
    return false;
  }
  
  // For mock tokens (created in mockApi/server.js)
  if (accessToken.startsWith('mock-token-')) {
    console.log("Token validation successful: Using mock token");
    // Always consider mock tokens valid in development
    return true;
  }
  
  try {
    // For real JWT tokens
    const decoded = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    const isValid = decoded.exp > currentTime;
    
    if (isValid) {
      console.log("Token validation successful: JWT token is valid");
    } else {
      console.log(`Token validation failed: Token expired at ${new Date(decoded.exp * 1000).toISOString()}`);
    }
    
    return isValid;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};