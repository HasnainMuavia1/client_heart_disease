import { useState, useEffect } from "react";
import {
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";

function ReportsTable({ reports, onApprove, onReject }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = searchTerm === "" || 
      (report?.patient?.name && report?.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || report?.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  useEffect(() => {
    console.log(filteredReports);
  }, [filteredReports]);
  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Report Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={handleCloseModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Report Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <div className="p-4">
              {/* Patient Information Section */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedReport?.patient?.name || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedReport?.patient?.email || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient ID</p>
                    <p className="font-medium">{selectedReport?.patient_id || selectedReport?.patientId || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">{selectedReport?.patient?.age || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Report Information Section */}
              <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Report Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Date Created</p>
                    <p className="font-medium">
                      {selectedReport?.created_at
                        ? new Date(selectedReport.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Report Type</p>
                    <p className="font-medium">{selectedReport?.type || "General Health Report"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedReport.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedReport.status === "reviewed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                    </span>
                  </div>
                  {selectedReport.reviewed_at && (
                    <div>
                      <p className="text-sm text-gray-600">Reviewed On</p>
                      <p className="font-medium">
                        {new Date(selectedReport.reviewed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Report Content Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Report Content</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                  {selectedReport?.content ? (
                    <div className="prose max-w-none">
                      <p>{selectedReport.content}</p>
                      
                      {/* Display prediction results if available */}
                      {selectedReport.prediction_results && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-800 mb-2">Prediction Results</h4>
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <p><strong>Prediction:</strong> {selectedReport.prediction_results.prediction}</p>
                            <p><strong>Confidence:</strong> {selectedReport.prediction_results.confidence}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No content available for this report.</p>
                  )}
                </div>
              </div>
              
              {/* Doctor's Comments Section - Only show if report has been reviewed */}
              {selectedReport.status !== 'pending' && selectedReport.doctor_comment && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Doctor's Comments</h3>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="italic">"{selectedReport.doctor_comment}"</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="flex justify-between">
          <div>
            {selectedReport && selectedReport.status === 'pending' && (
              <>
                <Button 
                  variant="success" 
                  className="mr-2"
                  onClick={() => {
                    onApprove && onApprove(selectedReport._id);
                    handleCloseModal();
                  }}
                >
                  <FaCheck className="mr-1" /> Approve Report
                </Button>
                <Button 
                  variant="danger"
                  onClick={() => {
                    onReject && onReject(selectedReport._id);
                    handleCloseModal();
                  }}
                >
                  <FaTimes className="mr-1" /> Mark as Critical
                </Button>
              </>
            )}
          </div>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <select
          className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report
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
            {filteredReports.map((report) => (
              <tr key={report._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {report?.patient?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report?.patient?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report?.created_at
                    ? new Date(report.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleViewDetail(report)}
                    title="View Report Details"
                  >
                    <FaEye className="w-5 h-5" />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      report.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : report.status === "reviewed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-800 mr-3"
                    onClick={() => handleViewDetail(report)}
                    title="View Detail"
                  >
                    <FaInfoCircle className="w-5 h-5" />
                  </button>
                  <button 
                    className="text-green-600 hover:text-green-800 mr-3" 
                    onClick={() => onApprove && onApprove(report._id)}
                    title="Approve Report"
                  >
                    <FaCheck className="w-5 h-5" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-800"
                    onClick={() => onReject && onReject(report._id)}
                    title="Reject Report"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsTable;
