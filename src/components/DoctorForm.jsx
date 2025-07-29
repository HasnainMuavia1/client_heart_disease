import React, { useState } from 'react';
import { FaCamera } from 'react-icons/fa';

function DoctorForm({ onAddDoctor }) {
  const [formData, setFormData] = useState({
    name: '',
    contactNo: '',
    picture: null,
    city: '',
    hospital: '',
    address: '',
    specialization: '',
  });

  const [preview, setPreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    onAddDoctor(formData);
    setFormData({
      name: '',
      contactNo: '',
      picture: null,
      city: '',
      hospital: '',
      address: '',
      specialization: '',
    });
    setPreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, picture: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
        Add New Doctor
      </h2>

      {/* Image Upload Field */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-gray-300">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaCamera className="text-gray-400 text-4xl" />
            )}
          </div>
          <label
            htmlFor="pictureUpload"
            className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-2 shadow-md cursor-pointer"
          >
            <FaCamera className="h-5 w-5 text-gray-600" />
          </label>
          <input
            id="pictureUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="contactNo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contact Number
          </label>
          <input
            type="tel"
            id="contactNo"
            name="contactNo"
            placeholder="Enter contact number"
            value={formData.contactNo}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            placeholder="Enter city"
            value={formData.city}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="hospital"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hospital
          </label>
          <input
            type="text"
            id="hospital"
            name="hospital"
            placeholder="Enter hospital"
            value={formData.hospital}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="specialization"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Specialization
          </label>
          <input
            type="text"
            id="specialization"
            name="specialization"
            placeholder="Enter specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address
          </label>
          <textarea
            id="address"
            name="address"
            placeholder="Enter address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            required
          ></textarea>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Add Doctor
        </button>
      </div>
    </form>
  );
}

export default DoctorForm;
