import api from './api';
import handleApiError from '../utils/errorHandler';

/**
 * Service for patient-related API calls
 */
const patientService = {
  /**
   * Get the current patient's profile
   * @returns {Promise<Object>} Patient profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/patient/profile');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update the current patient's profile
   * @param {Object} profileData - Updated profile information
   * @returns {Promise<Object>} Updated patient profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/patient/profile', profileData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update the patient's current location
   * @param {Object} locationData - Location data with coordinates
   * @returns {Promise<Object>} Updated location information
   */
  updateLocation: async (locationData) => {
    try {
      const response = await api.put('/patient/location', locationData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Find doctors near the patient's current location
   * @param {number} distance - Search radius in meters (default: 30000)
   * @returns {Promise<Array>} List of nearby doctors
   */
  findNearbyDoctors: async (distance = 30000) => {
    try {
      const response = await api.get(`/patient/nearby-doctors?distance=${distance}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default patientService;
