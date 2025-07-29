import React from 'react';
import { FaUserMd, FaUsers } from 'react-icons/fa';

function StatsCards({ doctors }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 bg-pink-100 rounded-full">
            <FaUserMd className="w-6 h-6 text-[#E31837]" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Total Doctors</p>
            <h3 className="text-2xl font-bold text-gray-700">{doctors.length}</h3>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="p-3 bg-pink-100 rounded-full">
            <FaUsers className="w-6 h-6 text-[#E31837]" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-700">1,234</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;

