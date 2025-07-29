import React from 'react';
import heroImage from '../assets/images/hero-img.jpg';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-red-100 via-red-200 to-red-300 overflow-hidden z-0">
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-around">
          <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
            <h1 className="text-5xl lg:text-6xl font-bold text-red-700 mb-6 leading-tight animate-fade-in-up">
              Empowering Your{' '}
              <span className="text-red-900 relative">
                Heart Health
                <span className="absolute bottom-0 left-0 w-full h-3 bg-red-300 opacity-50 transform -skew-x-12"></span>
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
              Discover cutting-edge tools and expert insights designed to help you predict, prevent, and manage heart disease. Take control of your health with our science-backed solutions and personalized care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
              <button className="px-8 py-3 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                Get Started
              </button>
              <button className="px-8 py-3 bg-white text-red-600 font-semibold rounded-full shadow-lg hover:bg-red-50 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
          <div className="lg:w-1/3 relative">
            <div className="absolute inset-0 bg-red-900 opacity-20 rounded-3xl transform rotate-3"></div>
            <img
              src={heroImage || "/placeholder.svg"}
              alt="Heart Health Illustration"
              className="rounded-3xl shadow-2xl w-full object-cover object-center relative z-10 transform -rotate-3 transition-transform duration-300 hover:rotate-0"
              style={{ height: '400px' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-900 to-transparent h-1/3 rounded-b-3xl z-20"></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default HeroSection;

