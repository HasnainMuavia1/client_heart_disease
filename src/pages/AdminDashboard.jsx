import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import DoctorsList from "../components/admin-dashboard/DoctorList";
import Reports from "../components/admin-dashboard/Reports";
import PatientsList from "../components/admin-dashboard/PatientsList";
import AdminSetup from "../components/admin-dashboard/AdminSetup";
import Dashboard from "../components/admin-dashboard/Dashboard";
import adminService from "../services/adminService";
import {
  FaHome,
  FaUserMd,
  FaChartBar,
  FaUsers,
  FaCog,
  FaBars,
} from "react-icons/fa";
import { authService } from "../services/authService";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdminSetup, setIsAdminSetup] = useState(false);

  // Reference to track initial mount for tab data effect
  const isInitialMount = useRef(true);

  // Admin data states
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define menu items for the admin sidebar
  const menuItems = [
    { id: "home", label: "Dashboard", icon: FaHome },
    { id: "doctors", label: "Doctors", icon: FaUserMd },
    { id: "patients", label: "Patients", icon: FaUsers },
    { id: "reports", label: "Reports", icon: FaChartBar },
    { id: "setup", label: "Admin Setup", icon: FaCog },
  ];

  // Check if admin is set up and fetch initial data
  useEffect(() => {
    console.log("AdminDashboard: Initial useEffect running");
    const checkAdminSetup = async () => {
      try {
        console.log("AdminDashboard: Setting loading to true");
        setLoading(true);

        // Check if user is logged in and is admin
        // First check local storage
        let userData = authService.getCurrentUser();
        console.log("AdminDashboard: User data from localStorage:", userData);

        // If no user in localStorage or token expired, fetch from API
        if (!userData) {
          try {
            console.log(
              "AdminDashboard: No user in localStorage, fetching from API"
            );
            userData = await authService.fetchUserData();
            console.log("AdminDashboard: User data from API:", userData);
          } catch (err) {
            console.error("Failed to fetch user data:", err);
            navigate("/signin");
            return;
          }
        }

        // Verify user is admin
        // Handle both direct user object and {success, data} structure
        const userObject = userData?.data ? userData.data : userData;
        console.log(
          "AdminDashboard: Checking if user is admin, role:",
          userObject?.role
        );

        if (!userObject) {
          console.log("AdminDashboard: No user data, redirecting to signin");
          navigate("/signin");
          return;
        }

        if (userObject.role !== "admin") {
          console.log(
            "AdminDashboard: Not an admin user, redirecting to signin"
          );
          navigate("/signin");
          return;
        }

        console.log("AdminDashboard: Admin user confirmed, proceeding");

        console.log("AdminDashboard: User data set", userObject);
        setUser(userObject);

        // Try to fetch admin stats to check if admin is set up
        console.log("AdminDashboard: Fetching stats");
        try {
          const statsData = await adminService.getStats();
          console.log("AdminDashboard: Stats received", statsData);
          setStats(statsData);
          setIsAdminSetup(true);
        } catch (error) {
          // If we get a 404, admin needs to be set up
          if (error.status === 404) {
            setIsAdminSetup(false);
            setActiveTab("setup");
          } else {
            throw error;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking admin setup:", error);
        setError("Failed to check admin setup. Please try again.");
        setLoading(false);
      }
    };

    checkAdminSetup();
  }, [navigate]);

  // Fetch data based on active tab
  useEffect(() => {
    // Skip initial render when component mounts
    // This prevents double loading with the checkAdminSetup effect
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const fetchTabData = async () => {
      if (!isAdminSetup) return;

      try {
        setLoading(true);

        switch (activeTab) {
          case "home":
            const statsData = await adminService.getStats();
            setStats(statsData?.data);
            break;

          case "doctors":
            const doctorsData = await adminService.getAllDoctors();
            setDoctors(doctorsData?.data);
            break;

          case "patients":
            const patientsData = await adminService.getAllPatients();
            setPatients(patientsData?.data);
            break;

          case "reports":
            const reportsData = await adminService.getAllReports();
            setReports(reportsData?.data);
            break;

          default:
            break;
        }

        setLoading(false);
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
        setError(`Failed to load ${activeTab} data. Please try again.`);
        setLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, isAdminSetup]);

  // Handle admin setup submission
  const handleAdminSetup = async (adminData) => {
    try {
      setLoading(true);
      await adminService.setupAdmin(adminData);
      setIsAdminSetup(true);
      setActiveTab("home");
      const statsData = await adminService.getStats();
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error("Error setting up admin:", error);
      setError("Failed to set up admin. Please try again.");
      setLoading(false);
    }
  };

  // Handle doctor verification
  const handleVerifyDoctor = async (doctorId) => {
    try {
      await adminService.verifyDoctor(doctorId);
      // Refresh doctors list
      const doctorsData = await adminService.getAllDoctors();
      setDoctors(doctorsData?.data);
    } catch (error) {
      console.error("Error verifying doctor:", error);
      setError("Failed to verify doctor. Please try again.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-t-transparent"></div>
          <p className="mt-3 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="mt-3 text-lg font-medium text-gray-900">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-red-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 focus:outline-none"
        >
          {mobileMenuOpen ? (
            <FaCog className="h-6 w-6" />
          ) : (
            <FaBars className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile unless menu is open */}
        <div
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } lg:block lg:w-64 bg-white shadow-lg z-10 ${
            mobileMenuOpen ? "absolute inset-y-0 left-0 w-64 mt-16 lg:mt-0" : ""
          }`}
        >
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            menuItems={menuItems}
            title="Admin Dashboard"
            primaryColor="red-600"
            responsive={true}
            user={user}
            onLogout={handleLogout}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {activeTab === "home" && <Dashboard stats={stats} />}
            {activeTab === "doctors" && (
              <DoctorsList
                doctors={doctors}
                onVerifyDoctor={handleVerifyDoctor}
              />
            )}
            {activeTab === "patients" && <PatientsList patients={patients} />}
            {activeTab === "reports" && <Reports reports={reports} />}
            {activeTab === "setup" && (
              <AdminSetup
                onSetupSubmit={handleAdminSetup}
                isSetup={isAdminSetup}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
