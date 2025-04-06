import axios from "axios";

// Determine the base URL for API requests.
// If VITE_API_URL is set in your environment (e.g., in a .env file),
// use that. Otherwise, assume we're using the MirageJS mock server,
// which requires the '/api' prefix based on its configuration in server.js.
const baseURL = import.meta.env.VITE_API_URL || '/api'; 

console.log(`✅ API Base URL: ${baseURL}`); // Log the base URL being used

// Create Axios Instance
const apiService = axios.create({ baseURL });

// Interceptors
// Interceptors allow us to run code before a request is sent or after a response is received.

// Request Interceptor:
// - Adds the Authorization header automatically if a token exists in localStorage.
// - Logs the request details (optional, useful for debugging).
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && !config.headers.Authorization) {
        // Set Authorization header only if it doesn't exist already
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Optional: Log request details for debugging
    // console.log("Starting Request:", {
    //   method: config.method,
    //   url: config.url,
    //   baseURL: config.baseURL,
    //   fullURL: config.baseURL + config.url,
    //   headers: config.headers,
    //   data: config.data,
    // });
    return config;
  },
  (error) => {
    // Handle request setup errors (rare)
    console.error("❌ Request Setup Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor:
// - Automatically extracts the `data` field from successful responses.
// - Standardizes error handling by extracting the error message.
// - Logs response/error details (optional, useful for debugging).
apiService.interceptors.response.use(
  (response) => {
    // Optional: Log successful response details
    // console.log("✅ Response Received:", {
    //   status: response.status,
    //   url: response.config.url,
    //   data: response.data, // The actual data from the server
    // });
    // For successful responses (2xx status code), just return the response object
    // The caller can access response.data
    return response; 
  },
  (error) => {
    // Handle errors (non-2xx status codes)
    console.error("❌ API Response Error:", error.response || error.message);
    
    // Try to extract a meaningful error message from the response
    // This depends on how your backend (or mock server) structures error responses
    const message = 
      error.response?.data?.message ||       // Check direct message property first (common practice)
      error.response?.data?.errors?.message || // Check nested structure
      error.message ||                     // Use the generic Axios error message
      "An unexpected API error occurred";  // Fallback message

    // Reject the promise with a standardized error object including the message
    // Components catching this can rely on error.message
    return Promise.reject({ message });
  }
);

export default apiService;