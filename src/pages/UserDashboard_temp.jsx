import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reportService from '../services/reportService';
import { authService } from '../services/authService';

// Import components
import Header from '../components/dashboard/Header';
import Navigation from '../components/dashboard/Navigation';
import DashboardTab from '../components/dashboard/DashboardTab';
import ReportsTab from '../components/dashboard/ReportsTab';
import ProfileTab from '../components/dashboard/ProfileTab';
import ReportModal from '../components/dashboard/ReportModal';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Report form state
  const [reportFile, setReportFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSeverity, setReportSeverity] = useState('medium');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // Handle file selection for report upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportFile(file);
      setFileName(file.name);
    }
  };

  // Handle report file submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    if (!reportFile) {
      setSubmitError('Please select a file to upload');
      return;
    }

    if (!reportTitle.trim()) {
      setSubmitError('Please enter a report title');
      return;
    }
    
    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);
    
    try {
      // Use reportService to upload the report
      await reportService.uploadReport(
        reportFile,
        reportTitle,
        reportDescription,
        reportSeverity
      );
      
      // Reset form and show success message
      setReportFile(null);
      setFileName('');
      setReportTitle('');
      setReportDescription('');
      setReportSeverity('medium');
      setSubmitSuccess(true);
      
      // Close modal after a delay
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        
        // Refresh reports if on reports tab
        if (activeTab === 'reports') {
          fetchReports();
        }
      }, 2000);
    } catch (err) {
      console.error('Error uploading report file:', err);
      setSubmitError(err.response?.data?.message || 'Failed to upload report file. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch reports when switching to reports tab
    if (tab === 'reports') {
      fetchReports();
    }
  };
  
  // Fetch all reports for the current user
  const fetchReports = async () => {
    setReportsLoading(true);
    setReportsError('');
    
    try {
      const data = await reportService.getMyReports();
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReportsError('Failed to load reports. Please try again.');
    } finally {
      setReportsLoading(false);
    }
  };
  
  // Fetch a specific report by ID and its nearby doctors
  const fetchReportDetails = async (reportId) => {
    try {
      const reportData = await reportService.getReportById(reportId);
      setSelectedReport(reportData);
      
      // Fetch nearby doctors for this report
      setDoctorsLoading(true);
      try {
        const doctors = await reportService.findDoctorsForReport(reportId);
        setNearbyDoctors(doctors || []);
      } catch (error) {
        console.error('Error fetching nearby doctors:', error);
      } finally {
        setDoctorsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (!userData) {
          navigate('/signin');
          return;
        }
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again.');
        // navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-2 text-gray-500">{error}</p>
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header user={user} handleLogout={() => {
        localStorage.removeItem('token');
        navigate('/signin');
      }} />
      
      {/* Navigation */}
      <Navigation activeTab={activeTab} handleTabChange={handleTabChange} />
      
      {/* Main Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardTab handleTabChange={handleTabChange} />
          )}
          
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ReportsTab 
              reports={reports}
              reportsLoading={reportsLoading}
              reportsError={reportsError}
              selectedReport={selectedReport}
              nearbyDoctors={nearbyDoctors}
              doctorsLoading={doctorsLoading}
              fetchReportDetails={fetchReportDetails}
              setSelectedReport={setSelectedReport}
              setIsModalOpen={setIsModalOpen}
            />
          )}
          
          {/* Predictions Tab */}
          {activeTab === 'predictions' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Health Predictions</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  This feature is coming soon. Stay tuned for health predictions based on your reports.
                </p>
              </div>
            </div>
          )}
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileTab user={user} />
          )}
        </div>
      </main>
      
      {/* Report Modal */}
      <ReportModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        reportTitle={reportTitle}
        setReportTitle={setReportTitle}
        reportDescription={reportDescription}
        setReportDescription={setReportDescription}
        reportSeverity={reportSeverity}
        setReportSeverity={setReportSeverity}
        fileName={fileName}
        handleFileChange={handleFileChange}
        handleSubmitReport={handleSubmitReport}
        submitLoading={submitLoading}
        submitError={submitError}
        submitSuccess={submitSuccess}
      />
    </div>
  );
};

export default UserDashboard;
