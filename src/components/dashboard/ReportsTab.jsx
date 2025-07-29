import React, { useState, useEffect } from "react";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaFileAlt,
  FaFilePdf,
  FaArrowLeft,
  FaPlus,
  FaEnvelope,
  FaPhone,
  FaUserCircle,
  FaCommentMedical,
  FaWhatsapp,
  FaHeartbeat,
  FaChartLine,
} from "react-icons/fa";
import chatService from "../../services/chatService";
import { authService } from "../../services/authService";

const ReportsTab = ({
  reports,
  reportsLoading,
  reportsError,
  selectedReport,
  nearbyDoctors,
  doctorsLoading,
  fetchReportDetails,
  setSelectedReport,
  setIsModalOpen,
}) => {
  // State for chat request functionality
  const [chatRequestLoading, setChatRequestLoading] = useState(false);
  const [chatRequestSent, setChatRequestSent] = useState(false);
  const [chatRequestError, setChatRequestError] = useState("");
  const [requestedDoctorId, setRequestedDoctorId] = useState(null);

  // State for doctor data with phone numbers
  const [doctorsWithPhoneData, setDoctorsWithPhoneData] = useState({});
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

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Function to send chat request to a doctor
  const sendChatRequest = async (doctorId) => {
    setChatRequestLoading(true);
    setRequestedDoctorId(doctorId);
    setChatRequestError("");

    try {
      await chatService.sendChatRequest(doctorId);
      setChatRequestSent(true);
      setTimeout(() => {
        setChatRequestSent(false);
        setRequestedDoctorId(null);
      }, 3000);
    } catch (err) {
      console.error("Error sending chat request:", err);
      setChatRequestError(
        err || "Failed to send chat request. Please try again."
      );
    } finally {
      setChatRequestLoading(false);
    }
  };

  // Function to format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone) => {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, "");
    return digits;
  };

  // Function to create WhatsApp URL
  const getWhatsAppUrl = (phone) => {
    const formattedPhone = formatPhoneForWhatsApp(phone);
    return `https://wa.me/${formattedPhone}`;
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            My Reports
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your submitted health reports.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <FaPlus className="mr-2" /> Submit Report
        </button>
      </div>

      {/* Loading state */}
      {reportsLoading && (
        <div className="text-center py-10">
          <FaSpinner className="inline-block animate-spin text-red-600 text-2xl mb-2" />
          <p className="text-gray-500">Loading reports...</p>
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
      {!reportsLoading && !reportsError && reports.length === 0 && (
        <div className="text-center py-10 border-t border-gray-200">
          <FaFileAlt className="inline-block text-gray-400 text-4xl mb-2" />
          <p className="text-gray-500 mb-4">
            You haven't submitted any reports yet.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Submit Your First Report
          </button>
        </div>
      )}

      {/* Reports list and detail view */}
      {!reportsLoading && !reportsError && reports.length > 0 && (
        <div className="border-t border-gray-200">
          {!selectedReport ? (
            // Reports list
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Severity
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.title || "Untitled Report"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(
                            report.severity
                          )}`}
                        >
                          {report.severity || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => fetchReportDetails(report._id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Report detail view
            <div className="px-4 py-5 sm:px-6">
              <div className="mb-6">
                <button
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedReport(null)}
                >
                  <FaArrowLeft className="mr-1" /> Back to Reports
                </button>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 flex justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      {selectedReport.title}
                      {selectedReport.isEcgReport && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded flex items-center">
                          <FaHeartbeat className="mr-1" /> ECG Analysis
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Submitted on {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <FaArrowLeft className="mr-1" /> Back to Reports
                  </button>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Severity
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                            selectedReport.severity
                          )}`}
                        >
                          {selectedReport.severity}
                        </span>
                      </dd>
                    </div>

                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Report ID
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedReport._id}
                      </dd>
                    </div>

                    {/* ECG Prediction Results */}
                    {selectedReport.isEcgReport && selectedReport.ecgPrediction && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <FaHeartbeat className="mr-1" /> ECG Analysis Results
                        </dt>
                        <dd className="mt-2 text-sm">
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="mb-2">
                              <span className="font-medium">Prediction: </span>
                              <span
                                className={
                                  selectedReport.ecgPrediction === "Normal"
                                    ? "text-green-600 font-medium"
                                    : "text-red-600 font-medium"
                                }
                              >
                                {selectedReport.ecgPrediction}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Confidence: </span>
                              <span>
                                {(selectedReport.ecgConfidence * 100).toFixed(
                                  2
                                )}
                                %
                              </span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-500">
                                This analysis was performed automatically by our
                                AI system based on the ECG image. Please consult
                                with a healthcare professional for proper medical
                                advice.
                              </p>
                            </div>
                          </div>
                        </dd>
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Description
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedReport.description || "No description"}
                      </dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Report File
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedReport.fileUrl ? (
                          <a
                            href={selectedReport.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            View Report File
                          </a>
                        ) : (
                          <span className="text-gray-500">
                            No file available
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Nearby Doctors */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recommended Doctors
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Healthcare professionals who can help with this report based
                    on their expertise.
                  </p>
                </div>

                {chatRequestError && (
                  <div className="mx-4 mb-4 bg-red-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">
                          {chatRequestError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {chatRequestSent && (
                  <div className="mx-4 mb-4 bg-green-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Chat request sent successfully!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {doctorsLoading && (
                  <div className="text-center py-10 border-t border-gray-200">
                    <FaSpinner className="inline-block animate-spin text-red-600 text-2xl mb-2" />
                    <p className="text-gray-500">
                      Finding doctors for this report...
                    </p>
                  </div>
                )}

                {!doctorsLoading && nearbyDoctors.length === 0 && (
                  <div className="text-center py-10 border-t border-gray-200">
                    <p className="text-gray-500">
                      No doctors found for this report type.
                    </p>
                  </div>
                )}

                {!doctorsLoading && nearbyDoctors.length > 0 && (
                  <div className="border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-4">
                      {nearbyDoctors.map((doctor) => (
                        <div
                          key={doctor._id}
                          className="bg-white overflow-hidden shadow rounded-lg"
                        >
                          <div className="px-4 py-5 sm:p-6">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
                                <FaUserCircle className="h-6 w-6 text-gray-500" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <h4 className="text-lg font-medium text-gray-900">
                                  Dr.{" "}
                                  {doctor.first_name ||
                                    doctor.name ||
                                    "Unknown"}{" "}
                                  {doctor.last_name || ""}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {doctor.specialization || "General Physician"}
                                </p>
                              </div>
                            </div>

                            {doctor.distance && (
                              <div className="mt-4 border-t border-gray-200 pt-4">
                                <div className="text-sm">
                                  <p className="text-gray-500">
                                    Distance:{" "}
                                    {(doctor.distance / 1000).toFixed(2)} km
                                  </p>
                                </div>
                              </div>
                            )}

                            {doctor.address && (
                              <div className="mt-2">
                                <div className="text-sm">
                                  <p className="text-gray-500">
                                    {[
                                      doctor.address.city,
                                      doctor.address.state,
                                      doctor.address.country,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="mt-5 flex flex-col space-y-2">
                              <div className="flex space-x-2">
                                {doctor.email && (
                                  <a
                                    href={`mailto:${doctor.email}`}
                                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  >
                                    <FaEnvelope className="mr-2" /> Email
                                  </a>
                                )}
                                {doctor.phone && (
                                  <a
                                    href={`tel:${doctor.phone}`}
                                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  >
                                    <FaPhone className="mr-2" /> Call
                                  </a>
                                )}
                              </div>

                              {/* WhatsApp Button - Only shown if doctor's phone is available from auth/me */}
                              {doctor.phone && (
                                <a
                                  href={getWhatsAppUrl(doctor.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-2"
                                >
                                  <FaWhatsapp className="mr-2" /> WhatsApp
                                </a>
                              )}

                              <button
                                onClick={() => sendChatRequest(doctor._id)}
                                disabled={
                                  chatRequestLoading &&
                                  requestedDoctorId === doctor._id
                                }
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                {chatRequestLoading &&
                                requestedDoctorId === doctor._id ? (
                                  <>
                                    <FaSpinner className="animate-spin mr-2" />{" "}
                                    Sending Request...
                                  </>
                                ) : (
                                  <>
                                    <FaCommentMedical className="mr-2" /> Send
                                    Chat Request
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
