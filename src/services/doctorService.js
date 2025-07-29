import api from './api';
import handleApiError from '../utils/errorHandler';

/**
 * Service for doctor-related API calls
 */
const doctorService = {
  /**
   * Get the current doctor's profile
   * @returns {Promise<Object>} Doctor profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/doctor/profile');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update the current doctor's profile
   * @param {Object} profileData - Updated profile information
   * @returns {Promise<Object>} Updated doctor profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/doctor/profile', profileData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update the doctor's current location
   * @param {Object} locationData - Location data with coordinates
   * @returns {Promise<Object>} Updated location information
   */
  updateLocation: async (locationData) => {
    try {
      const response = await api.put('/doctor/location', locationData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Review a patient's medical report
   * @param {string} reportId - ID of the report to review
   * @param {Object} reviewData - Review data including comment and status
   * @returns {Promise<Object>} Updated report with review
   */
  reviewReport: async (reportId, reviewData) => {
    try {
      const response = await api.put(`/doctor/review-report/${reportId}`, reviewData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all reports assigned to the doctor for review
   * @returns {Promise<Array>} List of reports to review
   */
  getReportsToReview: async () => {
    try {
      const response = await api.get('/doctor/reports-to-review');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default doctorService;
