import React, { useState } from "react";
import { FaUserMd, FaSearch, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import doctor1 from "../assets/images/doctor1.jpeg";
import doctor2 from "../assets/images/doctor2.jpeg";
import doctor3 from "../assets/images/doctor3.jpeg";

const doctorsData = [
  {
    id: 1,
    name: "Dr. John Doe",
    specialization: "Cardiologist",
    hospital: "City Heart Center",
    city: "Lahore",
    image: doctor1,
  },
  {
    id: 2,
    name: "Dr. Jane Smith",
    specialization: "Interventional Cardiologist",
    hospital: "Heart Care Hospital",
    city: "Karachi",
    image: doctor2,
  },
  {
    id: 3,
    name: "Dr. Emily Wilson",
    specialization: "Cardiac Surgeon",
    hospital: "Global Heart Institute",
    city: "Multan",
    image: doctor3,
  },
  // ... (add more doctors)
];

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const filteredDoctors = doctorsData.filter(
    (doctor) =>
      (doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
       doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
       doctor.city.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCity === "" || doctor.city === selectedCity)
  );

  const cities = [...new Set(doctorsData.map((doctor) => doctor.city))];

  return (
    <>
      <NavBar />
      <div className="min-h-screen mx-auto p-12 bg-gradient-to-b from-red-100 to-white">
        <div className="text-center mb-12 mx-auto">
          <h1 className="text-5xl font-bold text-red-600 mb-4">
            Meet Our Trusted Specialists
          </h1>
          <p className="text-xl text-gray-700 mx-auto max-w-3xl">
            Our team of experienced cardiologists and heart care experts is
            dedicated to providing personalized care and advanced solutions for
            a healthier heart. Consult with the best professionals to ensure
            your well-being.
          </p>
        </div>

        <div className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search Doctor"
              className="w-full sm:w-96 pl-12 pr-4 py-3 border-2 border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-300 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 text-xl" />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              className="w-full sm:w-64 pl-12 pr-4 py-3 border-2 border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-300 text-lg appearance-none"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 text-xl" />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transform hover:scale-105 duration-300 transition-all"
            >
              {doctor.image ? (
                <img
                  src={doctor.image || "/placeholder.svg"}
                  alt={doctor.name}
                  className="w-40 h-40 rounded-full mx-auto mb-6 object-cover border-4 border-red-200"
                />
              ) : (
                <div className="w-40 h-40 rounded-full mx-auto mb-6 bg-red-100 flex items-center justify-center">
                  <FaUserMd className="text-6xl text-red-400" />
                </div>
              )}
              <h3 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
                {doctor.name}
              </h3>
              <p className="text-red-500 text-center mb-4 font-medium">
                {doctor.specialization}
              </p>
              <p className="text-gray-600 text-center mb-2">
                <strong>Hospital:</strong> {doctor.hospital}
              </p>
              <p className="text-gray-600 text-center mb-4">
                <strong>City:</strong> {doctor.city}
              </p>
              <button
                onClick={() => window.open(`https://wa.me/1234567890`, "_blank")}
                className="mt-4 w-full bg-green-500 text-white py-3 px-6 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center text-lg font-medium"
              >
                <FaWhatsapp className="mr-2 text-xl" />
                Contact via WhatsApp
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
      
    </>
  );
};

export default Doctors;