import axios from "axios";
import { API_URL } from "./config";

// Determine the base URL for API requests.
// If VITE_API_URL is set in your environment (e.g., in a .env file),
// use that. Otherwise, assume we're using the MSW mock server
// which requires the '/api' prefix based on its configuration in server.js.
const baseURL = API_URL || "/api";

// Create Axios Instance
const api = axios.create({ baseURL });

api.defaults.withCredentials = true;

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("❌ Request Setup Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response);
    const { data } = response.data;
    return { ...data, error: null };
  },
  (error) => {
    const { response } = error;

    console.error("❌ API Response:", response);
    const { message } = response.data;

    return { error: message };
  }
);

export default api;
