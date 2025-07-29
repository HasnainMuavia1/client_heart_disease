import React from 'react';
import { FaHeartbeat, FaChartLine, FaUserMd, FaArrowRight } from 'react-icons/fa';

const services = [
  {
    icon: <FaHeartbeat className="text-4xl text-red-600" />,
    title: "Heart Health Monitoring",
    description: "Track your heart health metrics with our advanced monitoring tools.",
  },
  {
    icon: <FaChartLine className="text-4xl text-red-600" />,
    title: "Predictive Analytics",
    description: "Utilize AI-powered predictions to stay ahead of potential health issues.",
  },
  {
    icon: <FaUserMd className="text-4xl text-red-600" />,
    title: "Expert Consultations",
    description: "Connect with top cardiologists for personalized advice and care plans.",
  },
];

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2">
      <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <button className="flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors duration-300">
        Learn More <FaArrowRight className="ml-2" />
      </button>
    </div>
  );
};

const ServicesSection = () => {
  return (
    <section className="bg-gray-100 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <FeatureCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

