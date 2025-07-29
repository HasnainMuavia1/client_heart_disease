import api from "./api";
import handleApiError from "../utils/errorHandler";

/**
 * Service for ECG prediction-related API calls
 */
const ecgPredictionService = {
  /**
   * Upload an ECG image for prediction
   * @param {File} imageFile - The ECG image file to upload
   * @returns {Promise<Object>} Prediction results including prediction class and confidence
   */
  predictEcg: async (imageFile) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", imageFile);

      // Call the FastAPI endpoint
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("ECG Prediction error:", error);
      throw error;
    }
  },
};

export default ecgPredictionService;
