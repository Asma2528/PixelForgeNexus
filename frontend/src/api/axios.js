import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // Dynamically set base URL from environment variable
});

// Attach token automatically if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");  // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;  // Attach token to Authorization header
    }
    return config;
  },
  (error) => Promise.reject(error)  // Return rejected promise in case of request error
);

export default api;
