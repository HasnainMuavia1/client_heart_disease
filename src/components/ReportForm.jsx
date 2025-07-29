import { useState, useRef } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const MedicalReportForm = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    fatherName: "",
    cnic: "",
    contactNo: "",
    address: "",
    reportImage: null,
  });


  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };

  const handleImageFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setFormData({ ...formData, reportImage: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, reportImage: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    navigate("/doctors");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-100 via-red-200 to-red-300 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h2 className="text-2xl font-bold text-red-700 text-center mb-8">
              Submit Medical Report
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    className="w-full text-sm px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-colors"
                    placeholder="Enter patient's name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father Name
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full text-sm px-4 py-2 rounded-lg border border-gray-300 focus:outline-none  focus:ring-2 focus:ring-red-400 focus:border-transparent transition-colors"
                    placeholder="Enter father's name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNIC
                  </label>
                  <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    className="w-full text-sm px-4 py-2 rounded-lg border border-gray-300 focus:outline-none  focus:ring-2 focus:ring-red-400 focus:border-transparent transition-colors"
                    placeholder="Enter CNIC number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleChange}
                    className="w-full text-sm px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-colors"
                    placeholder="Enter contact number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full text-sm px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-colors resize-none"
                  placeholder="Enter complete address"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Report Image
                </label>
                <div
                  className={`relative h-[300px] rounded-lg border-2 border-dashed transition-colors ${
                    isDragging
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                    id="reportImage"
                  />
                  
                  {imagePreview ? (
                    <div className="relative h-full">
                      <img
                        src={imagePreview}
                        alt="Report Preview"
                        className="h-full w-full object-contain p-4"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center h-full cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiImage className="w-16 h-16 text-gray-400 mb-4" />
                      <div className="text-center">
                        <button
                          type="button"
                          className="mx-auto px-4 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors mb-2 flex items-center"
                        >
                          <FiUpload className="mr-2" />
                          Choose a file
                        </button>
                        <p className="text-sm text-gray-500">
                          or drag and drop your image here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalReportForm;

