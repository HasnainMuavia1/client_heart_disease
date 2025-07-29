/**
 * Global error handling utility for API requests
 */

/**
 * Handles API errors consistently across the application
 * @param {Error} error - The error object from axios
 * @returns {string} Formatted error message
 */
export const handleApiError = (error) => {
  const errorMessage = error.response?.data?.message || 
                       error.response?.data?.detail || 
                       error.message || 
                       'An unknown error occurred';
  
  // Handle different status codes
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // Unauthorized - token issue will be handled by api.js interceptors
        break;
      case 403:
        // Forbidden - user doesn't have permission
        console.error('Permission denied:', errorMessage);
        break;
      case 404:
        // Not found
        console.error('Resource not found:', errorMessage);
        break;
      case 422:
        // Validation error
        console.error('Validation error:', errorMessage);
        break;
      case 500:
        // Server error
        console.error('Server error:', errorMessage);
        break;
      default:
        console.error(`Error (${error.response.status}):`, errorMessage);
    }
  } else if (error.request) {
    // Request was made but no response received (network issue)
    console.error('Network error - no response received');
  } else {
    // Error in setting up the request
    console.error('Request setup error:', errorMessage);
  }
  
  return errorMessage;
};

export default handleApiError;
