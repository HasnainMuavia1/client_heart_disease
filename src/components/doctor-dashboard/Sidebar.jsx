import { useState } from 'react';
import { FaHome, FaClipboardList, FaUserCircle, FaCalendarAlt, FaBars, FaTimes } from 'react-icons/fa';
import { MdAnalytics } from 'react-icons/md';

function Sidebar({ activeTab, setActiveTab }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: FaHome },
    { id: 'reports', label: 'Patient Reports', icon: FaClipboardList },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
    { id: 'analytics', label: 'Analytics', icon: MdAnalytics },
    { id: 'profile', label: 'Profile', icon: FaUserCircle },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-red-600 text-white"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="p-4 bg-red-600 text-white">
          <h2 className="text-xl font-bold">Doctor Dashboard</h2>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors ${
                activeTab === item.id ? 'bg-red-50 text-red-600 border-r-4 border-red-600' : ''
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
}

export default Sidebar;
