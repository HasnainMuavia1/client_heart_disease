import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const Header = ({ user, handleLogout }) => {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaUserCircle className="h-8 w-8 text-red-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">
              Health Dashboard
            </h1>
          </div>
          <div>
            <span className="mr-4 text-sm text-gray-700">
              Welcome, {user?.first_name || user?.username || 'User'}
            </span>
            <button 
              onClick={handleLogout} 
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
