import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying
    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;

    //   try {
    //     // Try to refresh the token
    //     const refreshToken = localStorage.getItem("refresh_token");
    //     if (!refreshToken) {
    //       throw new Error("No refresh token available");
    //     }

    //     const response = await axios.post(
    //       "http://localhost:8000/api/users/token/refresh/",
    //       {
    //         refresh: refreshToken,
    //       }
    //     );

    //     const { access } = response.data;
    //     localStorage.setItem("access_token", access);

    //     // Retry the original request with new token
    //     originalRequest.headers["Authorization"] = `Bearer ${access}`;
    //     return api(originalRequest);
    //   } catch (refreshError) {
    //     // If refresh fails, logout user
    //     localStorage.removeItem("access_token");
    //     localStorage.removeItem("refresh_token");

    //     // Redirect to login page
    //     window.location.href = "/signin";
    //     return Promise.reject(refreshError);
    //   }
    // }

    return Promise.reject(error);
  }
);

export default api;
