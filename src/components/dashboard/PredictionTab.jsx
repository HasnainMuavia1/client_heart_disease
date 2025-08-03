import React, { useEffect, useState } from "react";
import { FaSpinner, FaExclamationTriangle, FaHeartbeat, FaChartLine, FaBell } from "react-icons/fa";

const PredictionTab = ({ reports, reportsLoading, reportsError }) => {
  // Filter reports to include ECG prediction reports
  // Check for either explicit isEcgReport flag or if the description contains ECG Analysis
  const ecgReports = reports.filter(report => {
    // Check for explicit ECG report flag
    if (report.isEcgReport && report.ecgPrediction) return true;
    
    // Check if metadata contains ECG prediction information
    if (report.metadata && report.metadata.isEcgReport) {
      // Extract prediction from metadata if possible
      if (report.metadata.ecgPrediction) {
        report.ecgPrediction = report.metadata.ecgPrediction;
        report.ecgConfidence = report.metadata.ecgConfidence || 0;
        return true;
      }
    }
    
    // Check if description contains ECG prediction information
    if (report.description && report.description.includes('ECG Analysis:')) {
      // Extract prediction from description if possible
      const match = report.description.match(/ECG Analysis: ([\w\s]+) \(Confidence: ([\d\.]+)%\)/i);
      if (match) {
        // Add extracted prediction data to the report object
        report.ecgPrediction = match[1];
        report.ecgConfidence = parseFloat(match[2]) / 100;
        return true;
      }
    }
    
    return false;
  });
  
  // Debug log to see what reports we have
  console.log('All reports:', reports);
  console.log('Filtered ECG reports:', ecgReports);
  
  // State to track the latest prediction and highlight animation
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [showHighlight, setShowHighlight] = useState(false);
  
  // Effect to identify the latest prediction when reports change
  useEffect(() => {
    if (ecgReports.length > 0) {
      // Sort reports by creation date (newest first)
      const sortedReports = [...ecgReports].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // Set the latest prediction
      setLatestPrediction(sortedReports[0]);
      
      // Trigger highlight animation
      setShowHighlight(true);
      
      // Remove highlight after animation completes
      const timer = setTimeout(() => {
        setShowHighlight(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [ecgReports]);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          ECG Predictions
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Heart disease predictions based on your ECG reports.
        </p>
      </div>

      {/* Loading state */}
      {reportsLoading && (
        <div className="text-center py-10">
          <FaSpinner className="inline-block animate-spin text-red-600 text-2xl mb-2" />
          <p className="text-gray-500">Loading predictions...</p>
        </div>
      )}

      {/* Error state */}
      {!reportsLoading && reportsError && (
        <div className="text-center py-10">
          <FaExclamationTriangle className="inline-block text-red-600 text-2xl mb-2" />
          <p className="text-red-600">{reportsError}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!reportsLoading && !reportsError && ecgReports.length === 0 && (
        <div className="text-center py-10 border-t border-gray-200">
          <FaHeartbeat className="inline-block text-gray-400 text-4xl mb-3" />
          <p className="text-gray-500">No ECG predictions yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload an ECG image in the Reports tab to get predictions.
          </p>
        </div>
      )}

      {/* Latest Prediction (if available) */}
      {!reportsLoading && !reportsError && latestPrediction && (
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <div className={`mb-6 ${showHighlight ? 'animate-pulse' : ''}`}>
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <FaBell className="mr-2 text-red-500" /> Latest Prediction
              </h4>
              <div className="mt-2 p-4 bg-white overflow-hidden shadow rounded-lg border border-red-200 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaHeartbeat className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-900">
                        {latestPrediction.title}
                      </dt>
                      <dd>
                        <div className="mt-1">
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                            ECG Analysis
                          </span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <FaChartLine className="text-gray-500 mr-2" />
                    <span className="text-sm font-medium">Prediction Results</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Prediction: </span>
                      <span className={latestPrediction.ecgPrediction && latestPrediction.ecgPrediction.toLowerCase().includes("normal") ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {latestPrediction.ecgPrediction}
                      </span>
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Confidence: </span>
                      <span>{(latestPrediction.ecgConfidence * 100).toFixed(2)}%</span>
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Submitted: {new Date(latestPrediction.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <h4 className="text-md font-medium text-gray-900 mb-4">All Predictions</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ecgReports.map((report) => (
                <div
                  key={report._id}
                  className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FaHeartbeat className="h-8 w-8 text-red-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-sm font-medium text-gray-900">
                            {report.title}
                          </dt>
                          <dd>
                            <div className="mt-1">
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                ECG Analysis
                              </span>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-2">
                        <FaChartLine className="text-gray-500 mr-2" />
                        <span className="text-sm font-medium">Prediction Results</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="font-medium">Prediction: </span>
                          <span className={report.ecgPrediction && report.ecgPrediction.toLowerCase().includes("normal") ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {report.ecgPrediction}
                          </span>
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Confidence: </span>
                          <span>{(report.ecgConfidence * 100).toFixed(2)}%</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Submitted: {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionTab;
