import api from './api';
import handleApiError from '../utils/errorHandler';

/**
 * Service for admin-related API calls
 */
const adminService = {
  /**
   * Set up an admin account (first-time setup)
   * @param {Object} adminData - Admin user data
   * @returns {Promise<Object>} Created admin data
   */
  setupAdmin: async (adminData) => {
    try {
      const response = await api.post('/admin/setup', adminData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Admin statistics
   */
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Verify a doctor's account
   * @param {string} doctorId - ID of the doctor to verify
   * @returns {Promise<Object>} Updated doctor data
   */
  verifyDoctor: async (doctorId) => {
    try {
      const response = await api.put(`/admin/verify-doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all doctors in the system
   * @returns {Promise<Array>} List of all doctors
   */
  getAllDoctors: async () => {
    try {
      const response = await api.get('/admin/doctors');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all patients in the system
   * @returns {Promise<Array>} List of all patients
   */
  getAllPatients: async () => {
    try {
      const response = await api.get('/admin/patients');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all reports in the system
   * @returns {Promise<Array>} List of all reports
   */
  getAllReports: async () => {
    try {
      const response = await api.get('/admin/reports');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default adminService;
