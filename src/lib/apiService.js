import axios from "axios";

const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiService.interceptors.request.use(
  (request) => {
    console.log("Starting Request", { url: request.url, method: request.method });
    return request;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => {
    console.log("Response:", { url: response.config.url, status: response.status });
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