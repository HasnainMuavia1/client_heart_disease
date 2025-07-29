import api from "./api";
import handleApiError from "../utils/errorHandler";

/**
 * Service for medical report-related API calls
 */
const reportService = {
  /**
   * Upload a new medical report
   * @param {Object} reportData - Report data including title, description, severity, and file
   * @returns {Promise<Object>} Uploaded report data
   */
  uploadReport: async (
    reportFile,
    reportTitle,
    reportDescription,
    reportSeverity,
    additionalMetadata = {}
  ) => {
    try {
      console.log(reportFile, reportTitle, reportDescription, reportSeverity, additionalMetadata);
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", reportTitle);
      formData.append("description", reportDescription);
      formData.append("severity", reportSeverity);
      formData.append("file", reportFile);
      
      // Add any additional metadata as JSON string
      if (Object.keys(additionalMetadata).length > 0) {
        formData.append("metadata", JSON.stringify(additionalMetadata));
      }

      // Override content-type header for file upload
      const response = await api.post("/report/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all reports for the current user
   * @returns {Promise<Array>} List of user's reports
   */
  getMyReports: async () => {
    try {
      const response = await api.get("/report");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get a specific report by ID
   * @param {string} reportId - ID of the report to retrieve
   * @returns {Promise<Object>} Report data
   */
  getReport: async (reportId) => {
    try {
      const response = await api.get(`/report/${reportId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Find doctors who can help with a specific report
   * @param {string} reportId - ID of the report
   * @returns {Promise<Array>} List of doctors relevant to the report
   */
  findDoctorsForReport: async (reportId) => {
    try {
      const response = await api.get(`/report/${reportId}/doctors`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default reportService;
