import "./App.css";
import DoctorSignup from "./components/DoctorSignup";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import AuthLayout from "./pages/AuthLayout";
import DoctorDashboard from "./pages/DoctorDashboard";
import UserDashboard from "./pages/UserDashboard";
import Doctors from "./pages/Doctors";
import HomePage from "./pages/Home";
import SubmitReport from "./pages/SubmitReport";
import Chat from "./pages/Chat";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PredictionProvider } from "./context/PredictionContext";
import { useState, useEffect } from "react";
import { authService } from "./services/authService";

// Protected route component that checks user role
const ProtectedRoute = ({ element, allowedRoles, redirectPath }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage
        let userData = authService.getCurrentUser();
        
        // If no user in localStorage, try to fetch from API
        if (!userData) {
          try {
            userData = await authService.fetchUserData();
          } catch (err) {
            console.log('Not authenticated, redirecting to signin');
            setLoading(false);
            return;
          }
        }

        // Handle both direct user object and {success, data} structure
        const userObject = userData?.data ? userData.data : userData;
        
        if (userObject && allowedRoles.includes(userObject.role)) {
          setUser(userObject);
          setAuthorized(true);
        } else {
          console.log(`User role ${userObject?.role} not authorized for this page`);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>;
  }

  // If not authorized, redirect to appropriate dashboard based on role
  if (!authorized) {
    // Get user role to determine where to redirect
    const userData = authService.getCurrentUser();
    const userObject = userData?.data ? userData.data : userData;
    
    if (userObject) {
      // Redirect based on role
      switch(userObject.role) {
        case 'admin':
          return <Navigate to="/admin-dashboard" replace />;
        case 'doctor':
          return <Navigate to="/doctor-dashboard" replace />;
        case 'patient':
          return <Navigate to="/dashboard" replace />;
        default:
          return <Navigate to="/signin" replace />;
      }
    } else {
      // No authenticated user, redirect to signin
      return <Navigate to="/signin" replace />;
    }
  }

  // User is authorized, render the protected component
  return element;
};

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <PredictionProvider>
            <Routes>
              {/* Public routes */}
              <Route
                path="/signin"
                element={
                  <AuthLayout>
                    <Signin />
                  </AuthLayout>
                }
              />
              <Route
                path="/doctor-signup"
                element={
                  <AuthLayout>
                    <DoctorSignup/>
                  </AuthLayout>
                }
              />
              <Route
                path="/signup"
                element={
                  <AuthLayout>
                    <Signup />
                  </AuthLayout>
                }
              />
              <Route path="/" element={<HomePage />} />
              
              {/* Protected routes with role-based access */}
              <Route path="/submit-report" element={<ProtectedRoute element={<SubmitReport />} allowedRoles={['patient']} />} />
              <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} />
              <Route path="/dashboard" element={<ProtectedRoute element={<UserDashboard />} allowedRoles={['patient']} />} />
              <Route path="/doctors" element={<ProtectedRoute element={<Doctors/>} allowedRoles={['patient']} />}/>
              <Route path="/doctor-dashboard" element={<ProtectedRoute element={<DoctorDashboard />} allowedRoles={['doctor']} />}/>
              <Route path="/chat" element={<ProtectedRoute element={<Chat />} allowedRoles={['patient', 'doctor']} />}/>
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PredictionProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
