import React from 'react';
import { FaHome, FaUserMd, FaChartBar } from 'react-icons/fa';

function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: FaHome },
    { id: 'doctors', label: 'Doctors List', icon: FaUserMd },
    { id: 'reports', label: 'Reports', icon: FaChartBar },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4 bg-[#E31837] text-white">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-3 text-gray-700 hover:bg-pink-50 hover:text-[#E31837] transition-colors ${
              activeTab === item.id ? 'bg-pink-50 text-[#E31837] border-r-4 border-[#E31837]' : ''
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;

