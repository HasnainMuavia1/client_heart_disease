import React from 'react';
import { 
  FaHeartbeat, 
  FaClipboardList, 
  FaChartLine, 
  FaUserCircle,
  FaFileMedical
} from 'react-icons/fa';

const DashboardTab = ({ handleTabChange, reports = [], user = {} }) => {
  // Calculate number of ECG reports with predictions
  const ecgReports = reports.filter(report => report.isEcgReport && report.ecgPrediction);
  const ecgReportsCount = ecgReports.length;
  
  // Get the latest 5 reports for the table
  const latestReports = [...reports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
    
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  // Helper function to get severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-300 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-full bg-red-100 p-3">
                <FaHeartbeat className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Heart Health Score</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {ecgReportsCount > 0 ? 
                        (ecgReports.some(report => report.ecgPrediction !== "Normal") ? "At Risk" : "Normal") : 
                        "No Data"}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-red-600 hover:text-red-500">
                View details
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-300 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-full bg-blue-100 p-3">
                <FaClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Reports Submitted</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{reports.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button 
                onClick={() => handleTabChange('reports')} 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                View all reports
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-300 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-full bg-green-100 p-3">
                <FaChartLine className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Health Trend</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{ecgReportsCount} ECG Predictions</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button 
                onClick={() => handleTabChange('predictions')} 
                className="font-medium text-green-600 hover:text-green-500"
              >
                View trends
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-300 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-full bg-yellow-100 p-3">
                <FaUserCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Profile Completion</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{user.name ? "Complete" : "Incomplete"}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button 
                onClick={() => handleTabChange('profile')} 
                className="font-medium text-yellow-600 hover:text-yellow-500"
              >
                Complete profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="mt-8">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Health Reports</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Your latest heart health assessments.</p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Risk Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Doctor
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {latestReports.length > 0 ? (
                    latestReports.map((report) => (
                      <tr key={report._id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{formatDate(report.createdAt)}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {report.ecgConfidence ? `${(report.ecgConfidence * 100).toFixed(0)}%` : "N/A"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getSeverityColor(report.severity)}`}>
                            {report.severity || "Unknown"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {report.isEcgReport ? (
                            <span className="flex items-center">
                              <FaFileMedical className="mr-1 text-red-500" />
                              ECG Analysis
                            </span>
                          ) : "Standard Report"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button 
                            onClick={() => {
                              handleTabChange('reports');
                              // You would need to add a function to select this specific report
                              // Something like: selectReport(report._id);
                            }} 
                            className="text-red-600 hover:text-red-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No reports found. Submit your first report to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <button className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                Previous
              </button>
              <button 
                onClick={() => handleTabChange('reports')}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500"
              >
                View All Reports
              </button>
              <button className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardTab;
