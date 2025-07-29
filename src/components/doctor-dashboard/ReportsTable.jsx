import { useState, useEffect } from "react";
import {
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";

function ReportsTable({ reports }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
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
    // const matchesSearch =
    //   report?.patient !== null &&
    //   report?.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    // const matchesStatus =
    //   statusFilter === "pending" || report?.status === statusFilter;
    return report;
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
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Patient Information</h3>
                <p>
                  <strong>Name:</strong> {selectedReport?.patient?.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedReport?.patient?.email}
                </p>
                <p>
                  <strong>ID:</strong>{" "}
                  {selectedReport?.patient_id || selectedReport?.patientId}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold">Report Information</h3>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedReport?.created_at
                    ? new Date(selectedReport.created_at).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedReport.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedReport.status === "reviewed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedReport.status}
                  </span>
                </p>
                <p>
                  <strong>Type:</strong> {selectedReport?.type || "General"}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold">Report Content</h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p>{selectedReport?.content || "No content available"}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
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
          <option value="">All Status</option>
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
                  <button className="text-blue-600 hover:text-blue-800">
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
                  <button className="text-green-600 hover:text-green-800 mr-3">
                    <FaCheck className="w-5 h-5" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
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
