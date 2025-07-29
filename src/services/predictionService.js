import api from './api';

export const predictionService = {
  // Submit a new prediction
  submitPrediction: async (predictionData) => {
    try {
      const response = await api.post('/prediction/', predictionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get all predictions for current user (patient or doctor)
  getPredictions: async () => {
    try {
      const response = await api.get('/prediction/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get a specific prediction by ID
  getPredictionById: async (id) => {
    try {
      const response = await api.get(`/prediction/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get predictions assigned to doctor
  getDoctorPredictions: async () => {
    try {
      const response = await api.get('/prediction/doctor_predictions/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update prediction status and notes (doctor only)
  updatePrediction: async (id, updateData) => {
    try {
      const response = await api.patch(`/prediction/${id}/`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get statistics for admin dashboard
  getStatistics: async () => {
    try {
      // This endpoint would need to be implemented in the backend
      const response = await api.get('/prediction/statistics/');
      return response.data;
    } catch (error) {
      // For now, return mock data if the endpoint doesn't exist
      return {
        totalPredictions: 120,
        positivePredictions: 45,
        negativePredictions: 75,
        pendingReviews: 15,
        weeklyData: [12, 19, 15, 8, 22, 30, 14],
        monthlyData: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80]
      };
    }
  }
};

export default predictionService;
