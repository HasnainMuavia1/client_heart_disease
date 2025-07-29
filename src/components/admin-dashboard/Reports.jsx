import React, { useState } from "react";
import { FaSearch, FaEye, FaDownload } from "react-icons/fa";

function Reports({ reports }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter reports based on search term and status filter
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report._id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Handle view report details
  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  // Close report details modal
  const closeModal = () => {
    setSelectedReport(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports Management</h1>
        <div className="flex items-center">
          <div className="mr-4">
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">Loading reports data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0"></div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {report.patient?.name || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.doctor ? (
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0">
                            <img
                              className="h-8 w-8 rounded-full object-cover"
                              src={
                                report.doctor?.picture ||
                                "https://via.placeholder.com/32"
                              }
                              alt={report.doctor?.name}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {report.doctor?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {report.doctor?.specialization}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          report.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : report.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FaEye className="inline mr-1" /> View
                      </button>
                      {report.attachments && report.attachments.length > 0 && (
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Download Attachments"
                        >
                          <FaDownload className="inline mr-1" /> Files
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No reports found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Report Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Report Information
                  </h3>
                  <p className="text-sm">
                    <span className="font-medium">ID:</span>{" "}
                    {selectedReport._id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        selectedReport.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : selectedReport.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedReport.status}
                    </span>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Patient Information
                  </h3>
                  {selectedReport.patient ? (
                    <>
                      <div className="flex items-center mb-2">
                        <span className="font-medium">
                          {selectedReport.patient.name}
                        </span>
                      </div>
                      <p className="text-sm">{selectedReport.patient.email}</p>
                      <p className="text-sm">
                        {selectedReport.patient.phone || "No phone"}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Patient information not available
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Doctor Information
                  </h3>
                  {selectedReport.doctor ? (
                    <>
                      <div className="flex items-center mb-2">
                        <span className="font-medium">
                          {selectedReport.doctor.name}
                        </span>
                      </div>
                      <p className="text-sm">
                        {selectedReport.doctor.specialization}
                      </p>
                      <p className="text-sm">
                        {selectedReport.doctor.hospital || "Independent"}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No doctor assigned</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  Report Content
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Symptoms
                    </h4>
                    <p className="text-sm">
                      {selectedReport.symptoms || "No symptoms recorded"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Diagnosis
                    </h4>
                    <p className="text-sm">
                      {selectedReport.diagnosis || "No diagnosis recorded"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Treatment
                    </h4>
                    <p className="text-sm">
                      {selectedReport.treatment || "No treatment recorded"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Notes
                    </h4>
                    <p className="text-sm">
                      {selectedReport.notes || "No additional notes"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedReport.attachments &&
                selectedReport.attachments.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-2">
                      Attachments
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedReport.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded-lg text-center"
                        >
                          <div className="h-20 flex items-center justify-center mb-2">
                            <div className="bg-gray-200 h-16 w-16 rounded flex items-center justify-center">
                              <FaDownload className="text-gray-600 text-xl" />
                            </div>
                          </div>
                          <p className="text-xs truncate">{attachment.name}</p>
                          <a
                            href={attachment.fileUrl || attachment.url}
                            download
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
