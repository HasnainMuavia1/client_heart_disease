import React, { useState, useEffect } from "react";
import { FaSearch, FaEye, FaCheckCircle } from "react-icons/fa";

function DoctorsList({ doctors, onVerifyDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [filterVerified, setFilterVerified] = useState("all");

  // Filter doctors based on search term and verification status
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hospital?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVerified =
      filterVerified === "all" ||
      (filterVerified === "verified" && doctor.isVerified) ||
      (filterVerified === "unverified" && !doctor.isVerified);

    return matchesSearch && matchesVerified;
  });
  
  useEffect(() => {
    console.log("Doctors data loaded:", doctors.length);
  }, [doctors]);
  // Handle view doctor details
  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
  };

  // Close doctor details modal
  const closeModal = () => {
    setSelectedDoctor(null);
  };

  // Handle doctor verification
  const handleVerifyDoctor = async (doctorId) => {
    try {
      setVerifying(true);
      await onVerifyDoctor(doctorId);
      setVerifying(false);

      // If we're viewing this doctor's details, update the modal
      if (selectedDoctor && selectedDoctor._id === doctorId) {
        const updatedDoctor = doctors.find((d) => d._id === doctorId);
        if (updatedDoctor) {
          setSelectedDoctor(updatedDoctor);
        }
      }
    } catch (error) {
      console.error("Error verifying doctor:", error);
      setVerifying(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctors Management</h1>
        <div className="flex items-center">
          <div className="mr-4">
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
            >
              <option value="all">All Doctors</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctors..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">Loading doctors data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hospital
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
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
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.hospital || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.specialization || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doctor.isVerified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDoctor(doctor)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FaEye className="inline mr-1" /> View
                      </button>
                      {!doctor.isVerified && (
                        <button
                          onClick={() => handleVerifyDoctor(doctor._id)}
                          disabled={verifying}
                          className={`text-green-600 hover:text-green-900 ${
                            verifying ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <FaCheckCircle className="inline mr-1" /> Verify
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
                    No doctors found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Doctor Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold">
                          {selectedDoctor.name}
                        </h3>
                        {selectedDoctor.isVerified && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500">{selectedDoctor.email}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Contact Information
                    </h4>
                    <p className="text-gray-800">
                      Phone: {selectedDoctor.phone || "N/A"}
                    </p>
                    <p className="text-gray-800">
                      Address: {selectedDoctor.address || "N/A"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Professional Information
                    </h4>
                    <p className="text-gray-800">
                      Specialization: {selectedDoctor.specialization || "N/A"}
                    </p>
                    <p className="text-gray-800">
                      Hospital: {selectedDoctor.hospital || "N/A"}
                    </p>
                    <p className="text-gray-800">
                      Experience: {selectedDoctor.experience || "N/A"} years
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Education & Qualifications
                    </h4>
                    <p className="text-gray-800">
                      {selectedDoctor.qualifications ||
                        "No qualification information available"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Account Information
                    </h4>
                    <p className="text-gray-800">
                      Member Since:{" "}
                      {new Date(selectedDoctor.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-800">
                      Last Login:{" "}
                      {selectedDoctor.lastLogin
                        ? new Date(selectedDoctor.lastLogin).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  {!selectedDoctor.isVerified && (
                    <div className="mt-6">
                      <button
                        onClick={() => handleVerifyDoctor(selectedDoctor._id)}
                        disabled={verifying}
                        className={`flex items-center justify-center w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors ${
                          verifying ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        <FaCheckCircle className="mr-2" />
                        {verifying ? "Verifying..." : "Verify Doctor"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
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

export default DoctorsList;
