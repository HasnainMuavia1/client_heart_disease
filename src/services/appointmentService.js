import api from "./api";
import handleApiError from "../utils/errorHandler";

/**
 * Service for appointment-related API calls
 */
const appointmentService = {
  /**
   * Get all appointments for a doctor
   * @returns {Promise<Array>} List of appointments
   */
  getDoctorAppointments: async () => {
    try {
      // Updated endpoint to match backend API structure
      const response = await api.get("/chat/requests");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all appointments for a patient
   * @returns {Promise<Array>} List of appointments
   */
  getPatientAppointments: async () => {
    try {
      const response = await api.get("/appointments/patient");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Created appointment
   */
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post("/appointments", appointmentData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Approve an appointment
   * @param {string} appointmentId - ID of the appointment to approve
   * @returns {Promise<Object>} Updated appointment data
   */
  approveAppointment: async (appointmentId) => {
    try {
      const response = await api.put(`/appointments/approve/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Reject an appointment
   * @param {string} appointmentId - ID of the appointment to reject
   * @returns {Promise<Object>} Updated appointment data
   */
  rejectAppointment: async (appointmentId) => {
    try {
      const response = await api.put(`/appointments/reject/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Cancel an appointment
   * @param {string} appointmentId - ID of the appointment to cancel
   * @returns {Promise<Object>} Updated appointment data
   */
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.put(`/appointments/cancel/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Complete an appointment
   * @param {string} appointmentId - ID of the appointment to mark as completed
   * @returns {Promise<Object>} Updated appointment data
   */
  completeAppointment: async (appointmentId) => {
    try {
      const response = await api.put(`/appointments/complete/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default appointmentService;
