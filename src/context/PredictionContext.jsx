import React, { createContext, useState, useContext } from 'react';
import { predictionService } from '../services/predictionService';

// Create the prediction context
const PredictionContext = createContext();

export const PredictionProvider = ({ children }) => {
  const [predictions, setPredictions] = useState([]);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // Submit a new prediction
  const submitPrediction = async (predictionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await predictionService.submitPrediction(predictionData);
      setPredictions([response, ...predictions]);
      setCurrentPrediction(response);
      return response;
    } catch (err) {
      setError(err.response?.data || 'Failed to submit prediction. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get all predictions for current user
  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictionService.getPredictions();
      setPredictions(data);
      return data;
    } catch (err) {
      setError(err.response?.data || 'Failed to fetch predictions.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a specific prediction by ID
  const fetchPredictionById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictionService.getPredictionById(id);
      setCurrentPrediction(data);
      return data;
    } catch (err) {
      setError(err.response?.data || 'Failed to fetch prediction details.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get predictions assigned to doctor
  const fetchDoctorPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictionService.getDoctorPredictions();
      setPredictions(data);
      return data;
    } catch (err) {
      setError(err.response?.data || 'Failed to fetch doctor predictions.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update prediction status and notes (doctor only)
  const updatePrediction = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictionService.updatePrediction(id, updateData);
      
      // Update predictions list
      setPredictions(predictions.map(pred => 
        pred.id === id ? data : pred
      ));
      
      // Update current prediction if it's the one being viewed
      if (currentPrediction && currentPrediction.id === id) {
        setCurrentPrediction(data);
      }
      
      return data;
    } catch (err) {
      setError(err.response?.data || 'Failed to update prediction.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get statistics for dashboard
  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictionService.getStatistics();
      setStatistics(data);
      return data;
    } catch (err) {
      setError(err.response?.data || 'Failed to fetch statistics.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PredictionContext.Provider
      value={{
        predictions,
        currentPrediction,
        loading,
        error,
        statistics,
        submitPrediction,
        fetchPredictions,
        fetchPredictionById,
        fetchDoctorPredictions,
        updatePrediction,
        fetchStatistics,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

// Custom hook to use the prediction context
export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error('usePrediction must be used within a PredictionProvider');
  }
  return context;
};

export default PredictionContext;
