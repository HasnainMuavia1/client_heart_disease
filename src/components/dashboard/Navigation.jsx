import React from 'react';

const Navigation = ({ activeTab, handleTabChange }) => {
  return (
    <div className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'dashboard' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'reports' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('reports')}
          >
            My Reports
          </button>
          <button
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'predictions' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('predictions')}
          >
            Predictions
          </button>
          <button
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'chats' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('chats')}
          >
            Chats
          </button>
          <button
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'profile' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('profile')}
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
