import api from "./api";
import handleApiError from "../utils/errorHandler";

/**
 * Service for chat-related API calls
 */
const chatService = {
  /**
   * Send a chat request to a doctor
   * @param {string} doctorId - ID of the doctor to request chat with
   * @returns {Promise<Object>} Chat request data
   */
  sendChatRequest: async (doctorId) => {
    try {
      const response = await api.post(`/chat/request/${doctorId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all chat requests received by a doctor
   * @returns {Promise<Array>} List of chat requests
   */
  getDoctorChatRequests: async () => {
    try {
      const response = await api.get("/chat/requests");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all chat requests sent by the current patient
   * @returns {Promise<Array>} List of chat requests
   */
  getPatientChatRequests: async () => {
    try {
      const response = await api.get("/chat/myrequests");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Approve a chat request
   * @param {string} patientId - ID of the patient whose chat request to approve
   * @returns {Promise<Object>} Updated chat request data
   */
  approveChatRequest: async (patientId) => {
    try {
      const response = await api.put(`/chat/approve/${patientId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Reject a chat request
   * @param {string} patientId - ID of the patient whose chat request to reject
   * @returns {Promise<Object>} Updated chat request data
   */
  rejectChatRequest: async (patientId) => {
    try {
      const response = await api.put(`/chat/reject/${patientId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all active chats for the current user
   * @returns {Promise<Array>} List of active chats
   */
  getMyChats: async () => {
    try {
      const response = await api.get("/chat");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all messages for a specific chat
   * @param {string} chatId - ID of the chat
   * @returns {Promise<Array>} List of chat messages
   */
  getChatMessages: async (chatId) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Send a message in a specific chat
   * @param {string} chatId - ID of the chat
   * @param {string} message - Message text to send
   * @returns {Promise<Object>} Sent message data
   */
  sendMessage: async (chatId, message) => {
    try {
      const response = await api.post(`/chat/${chatId}`, { message });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default chatService;
