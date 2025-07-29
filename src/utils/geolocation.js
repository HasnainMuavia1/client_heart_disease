/**
 * Utility functions for handling geolocation
 */

/**
 * Get the user's current coordinates using the browser's Geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>} A promise that resolves to the user's coordinates
 */
export const getCurrentCoordinates = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error.message);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

/**
 * Check if geolocation is supported by the browser
 * @returns {boolean} Whether geolocation is supported
 */
export const isGeolocationSupported = () => {
  return !!navigator.geolocation;
};

export default {
  getCurrentCoordinates,
  isGeolocationSupported
};
