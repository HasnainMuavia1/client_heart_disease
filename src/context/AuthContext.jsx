import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();
        
        if (currentUser && isAuth) {
          setUser(currentUser);
          
          // Redirect to appropriate dashboard if on signin or signup pages
          const currentPath = window.location.pathname;
          if (currentPath === '/signin' || currentPath === '/signup' || currentPath === '/') {
            if (currentUser.is_doctor) {
              navigate('/doctor-dashboard');
            } else if (currentUser.is_superuser) {
              navigate('/admin-dashboard');
            } else {
              navigate('/dashboard');
            }
          }
        }
      } catch (err) {
        console.error('Error checking authentication status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, [navigate]);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authService.login(username, password);console.log(userData)
      setUser(userData);
      
      // Redirect based on user role
      if (userData.is_doctor) {
        navigate('/doctor-dashboard');
      } else if (userData.is_superuser) {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
      
      return userData;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      navigate('/signin');
      return response;
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register doctor function
  const registerDoctor = async (doctorData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.registerDoctor(doctorData);
      navigate('/signin');
      return response;
    } catch (err) {
      setError(err.response?.data || 'Doctor registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/signin');
  };

  // Update profile function
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.response?.data || 'Profile update failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        registerDoctor,
        logout,
        updateProfile,
        isAuthenticated: authService.isAuthenticated,
        isDoctor: authService.isDoctor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
