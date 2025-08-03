import React, { useState } from "react";
import { FaCloudUploadAlt, FaHeartbeat } from "react-icons/fa";
import ecgPredictionService from "../../services/ecgPredictionService";

const ReportModal = ({
  isModalOpen,
  setIsModalOpen,
  reportTitle,
  setReportTitle,
  reportDescription,
  setReportDescription,
  reportSeverity,
  setReportSeverity,
  fileName,
  handleFileChange,
  handleSubmitReport,
  submitLoading,
  submitError,
  submitSuccess,
  isEcgPrediction,
  setIsEcgPrediction,
  predictionResult,
  setPredictionResult,
  reportFile
}) => {
  // Local state for prediction loading and errors
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={() => setIsModalOpen(false)}
        ></div>

        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Submit Health Report
                </h3>
                <div className="mt-2">
                  <form onSubmit={handleSubmitReport}>
                    {/* Report Title */}
                    <div className="mb-4">
                      <label
                        htmlFor="report-title"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Report Title *
                      </label>
                      <input
                        type="text"
                        id="report-title"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        placeholder="Enter report title"
                        required
                      />
                    </div>

                    {/* Report Description */}
                    <div className="mb-4">
                      <label
                        htmlFor="report-description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="report-description"
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        placeholder="Enter report description"
                      />
                    </div>

                    {/* Report Severity */}
                    <div className="mb-4">
                      <label
                        htmlFor="report-severity"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Severity *
                      </label>
                      <select
                        id="report-severity"
                        value={reportSeverity}
                        onChange={(e) => setReportSeverity(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    {/* ECG Prediction Option */}
                    <div className="mb-4">
                      <div className="flex items-center">
                        <input
                          id="ecg-prediction"
                          name="ecg-prediction"
                          type="checkbox"
                          checked={isEcgPrediction}
                          onChange={() => {
                            setIsEcgPrediction(!isEcgPrediction);
                            setPredictionResult(null);
                            setPredictionError("");
                          }}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="ecg-prediction"
                          className="ml-2 block text-sm text-gray-900 flex items-center"
                        >
                          <FaHeartbeat className="mr-1 text-red-600" />
                          This is an ECG image for heart disease prediction
                        </label>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Upload {isEcgPrediction ? "ECG Image" : "Report File"} *
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                accept={isEcgPrediction ? "image/png,image/jpeg" : "image/png,image/jpeg,application/pdf"}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {fileName ? fileName : "No file selected"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {isEcgPrediction ? "JPG, JPEG, PNG ECG images only" : "JPG, JPEG, PNG up to 10MB"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* ECG Prediction Results (if applicable) */}
                    {isEcgPrediction && reportFile && (
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setPredictionLoading(true);
                              setPredictionError("");
                              setPredictionResult(null);
                              
                              const result = await ecgPredictionService.predictEcg(reportFile);
                              setPredictionResult(result);
                              
                              // Automatically add prediction to description field
                              if (result && result.prediction) {
                                const predictionText = `ECG Analysis: ${result.prediction} (Confidence: ${result.confidence}%)`;
                                
                                // If description is empty, just set it to the prediction
                                // Otherwise, add the prediction at the beginning of the existing description
                                if (!reportDescription || reportDescription.trim() === "") {
                                  setReportDescription(predictionText);
                                } else {
                                  setReportDescription(`${predictionText}\n\n${reportDescription}`);
                                }
                              }
                            } catch (error) {
                              console.error("Prediction error:", error);
                              setPredictionError(error.message || "Failed to get prediction");
                            } finally {
                              setPredictionLoading(false);
                            }
                          }}
                          disabled={predictionLoading}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {predictionLoading ? (
                            <>Processing ECG Image...</>
                          ) : (
                            <>Get Heart Disease Prediction</>
                          )}
                        </button>
                        
                        {predictionError && (
                          <div className="mt-2 rounded-md bg-red-50 p-2">
                            <p className="text-sm text-red-700">{predictionError}</p>
                          </div>
                        )}
                        
                        {predictionResult && (
                          <div className="mt-3 p-3 border rounded-md bg-gray-50">
                            <h4 className="font-medium text-gray-900">ECG Analysis Results</h4>
                            <div className="mt-2">
                              <p className="text-sm">
                                <span className="font-medium">Prediction:</span>{" "}
                                <span className={predictionResult.prediction === "Normal" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                  {predictionResult.prediction}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Confidence:</span>{" "}
                                {(predictionResult.confidence * 100).toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error Message */}
                    {submitError && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-red-400"
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
                            <p className="text-sm text-red-700">
                              {submitError}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {submitSuccess && (
                      <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-green-400"
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
                            <p className="text-sm text-green-700">
                              Report submitted successfully!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={submitLoading || (isEcgPrediction && !predictionResult)}
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        {submitLoading ? "Submitting..." : "Submit Report"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
