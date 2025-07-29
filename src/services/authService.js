import api from "./api";
import geolocationUtils from "../utils/geolocation";

export const authService = {
  // Login user
  login: async (username, password) => {
    try {
      const response = await api.post("/auth/login", {
        email: username, // Using email as username
        password,
      });

      // Store tokens in localStorage
      localStorage.setItem("access_token", response.data.token);
      localStorage.setItem("refresh_token", response.data.refreshToken);

      // Store user data if available in response
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return response.data.user;
      }

      // If user data not in response, fetch it
      const userResponse = await api.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(userResponse.data));

      return userResponse.data;
    } catch (error) {
      throw error;
    }
  },

  // Register user (patient)
  register: async (userData, includeCoordinates = true) => {
    try {
      // If coordinates should be included, try to get them
      if (includeCoordinates && geolocationUtils.isGeolocationSupported()) {
        try {
          const coordinates = await geolocationUtils.getCurrentCoordinates();
          // Format coordinates as expected by the API
          if (!userData.location) {
            userData.location = {};
          }
          userData.location.coordinates = [
            coordinates.longitude,
            coordinates.latitude,
          ];
        } catch (geoError) {
          console.warn("Could not get user coordinates:", geoError.message);
          // Continue registration without coordinates
        }
      }

      const response = await api.post("/register/patient", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register doctor
  registerDoctor: async (doctorData, includeCoordinates = true) => {
    try {
      // If coordinates should be included, try to get them
      if (includeCoordinates && geolocationUtils.isGeolocationSupported()) {
        try {
          const coordinates = await geolocationUtils.getCurrentCoordinates();
          // Format coordinates as expected by the API
          if (!doctorData.location) {
            doctorData.location = {};
          }
          doctorData.location.coordinates = [
            coordinates.longitude,
            coordinates.latitude,
          ];
        } catch (geoError) {
          console.warn("Could not get doctor coordinates:", geoError.message);
          // Continue registration without coordinates
        }
      }

      const response = await api.post("/register/doctor", doctorData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        // Send request to blacklist the token
        await api.post("/auth/logout", { refresh: refreshToken });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Remove tokens and user data from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem("access_token") !== null;
  },

  // Check if user is a doctor
  isDoctor: () => {
    const user = localStorage.getItem("user");
    if (!user) return false;

    const userData = JSON.parse(user);
    return userData.is_doctor === true;
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      // Get user type from stored data
      const user = authService.getCurrentUser();
      const endpoint =
        user && user.is_doctor ? "/doctor/profile" : "/patient/profile";

      const response = await api.put(endpoint, userData);

      // Update stored user data
      localStorage.setItem("user", JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put("/auth/change-password", passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user location
  updateLocation: async (coordinates) => {
    try {
      // Get user type from stored data
      const user = authService.getCurrentUser();
      const endpoint =
        user && user.is_doctor ? "/doctor/location" : "/patient/location";

      const response = await api.put(endpoint, { coordinates });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fetch fresh user data from server
  fetchUserData: async () => {
    try {
      const response = await api.get("/auth/me");

      // Update stored user data
      localStorage.setItem("user", JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get doctor details including phone number
  getDoctorDetails: async (doctorId) => {
    try {
      const response = await api.get(`/doctor/${doctorId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching doctor details: ${error}`);
      throw error;
    }
  },
};

export default authService;
