import axios from "axios";
import { refreshAccessToken } from "../auth";

// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:5500/api", // Backend Base URI
  withCredentials: true, // Allows sending cookies
});

// Function to get the latest access token from localStorage
const getAccessToken = () => localStorage.getItem("accessToken");

// Function to set the access token in localStorage
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken"); // Remove token if null
  }
};

// Request Interceptor: Attach Access Token to Requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Expired Access Tokens refresh through Refresh Token
const MAX_REFRESH_RETRIES = 1;
let refreshAttempts = 0;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If Unauthorized (401), attempt refresh if retries are available
    if (error.response?.status === 401) {
      // Prevent infinite retry loop by checking if retry limit has been hit
      if (refreshAttempts < MAX_REFRESH_RETRIES) {
        refreshAttempts++;

        try {
          const newToken = await refreshAccessToken(); // Fetch new token
          setAccessToken(newToken.accessToken); // Store it in localStorage
          error.config.headers.Authorization = `Bearer ${newToken.accessToken}`; // Retry request
          return api.request(error.config);
        } catch (refreshError) {
          console.error("Token Refresh Failed:", refreshError);
          setAccessToken(null); // Remove expired token
          return Promise.reject(refreshError);
        }
      }
      // If Refresh fails or retry limit is hit, log the user out
      setAccessToken(null);
      refreshAttempts = 0;
    }
    return Promise.reject(error);
  }
);

export default api;
