import axios from "axios";

// Initialize with token from localStorage if it exists
const token = localStorage.getItem("accessToken");
const initialHeaders = {
  "Content-Type": "application/json",
};

if (token) {
  initialHeaders.Authorization = `Bearer ${token}`;
}

// Determine if we're using the mock API server
const usingMockApi = !import.meta.env.VITE_API_URL;

// Set the base URL - if using mock API, we need to include the /api prefix
const baseURL = usingMockApi 
  ? '/api' // Mock server has a namespace 'api'
  : import.meta.env.VITE_API_URL || '';

const apiService = axios.create({
  baseURL,
  headers: initialHeaders,
});

apiService.interceptors.request.use(
  (request) => {
    console.log("Starting Request", { 
      url: request.url, 
      method: request.method,
      baseURL: request.baseURL,
      fullURL: request.baseURL + request.url
    });
    return request;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => {
    console.log("Response:", { 
      url: response.config.url, 
      status: response.status,
      data: response.data
    });
    return response.data;
  },
  (error) => {
    console.error("Response Error:", error);
    const message = error.response?.data?.errors?.message || 
                   error.response?.data?.message || 
                   "Something went wrong";
    return Promise.reject({ message });
  }
);

export default apiService;