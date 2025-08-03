import { useState } from 'react';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';

/**
 * Reusable Sidebar component that can be configured for different user roles
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.setActiveTab - Function to set active tab
 * @param {Array} props.menuItems - Array of menu items with id, label, and icon
 * @param {string} props.title - Title displayed at the top of sidebar
 * @param {string} props.primaryColor - Primary color for active items and header (hex or tailwind class name)
 * @param {boolean} props.responsive - Whether sidebar should be responsive (collapsible on mobile)
 * @param {Object} props.user - User object containing user information
 * @param {Function} props.onLogout - Function to handle logout
 */
function Sidebar({ 
  activeTab, 
  setActiveTab, 
  menuItems, 
  title, 
  primaryColor = 'red-600', 
  responsive = true,
  user,
  onLogout
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Determine color classes based on primaryColor
  const isHexColor = primaryColor.startsWith('#');
  const bgColorClass = isHexColor ? '' : `bg-${primaryColor}`;
  const textColorClass = isHexColor ? '' : `text-${primaryColor}`;
  const hoverBgColorClass = isHexColor ? '' : `hover:bg-${primaryColor.replace('600', '50')}`;
  const hoverTextColorClass = isHexColor ? '' : `hover:${textColorClass}`;
  const borderColorClass = isHexColor ? '' : `border-${primaryColor}`;
  
  // Inline styles for hex colors
  const hexStyles = isHexColor ? {
    headerBg: { backgroundColor: primaryColor },
    textColor: { color: primaryColor },
    hoverBg: { backgroundColor: `${primaryColor}10` }, // 10% opacity version
    borderColor: { borderRightColor: primaryColor }
  } : {};

  return (
    <>
      {/* Mobile Menu Button - Only shown if responsive is true */}
      {responsive && (
        <button
          className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md ${bgColorClass} text-white`}
          style={isHexColor ? { backgroundColor: primaryColor } : {}}
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${
          responsive ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        } ${responsive ? 'lg:translate-x-0 fixed lg:static' : ''} inset-y-0 left-0 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-40`}
      >
        <div 
          className={`p-4 ${bgColorClass} text-white`}
          style={isHexColor ? hexStyles.headerBg : {}}
        >
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <nav className="mt-6 flex flex-col h-full">
          <div className="flex-grow">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (responsive) setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-gray-700 ${hoverBgColorClass} ${hoverTextColorClass} transition-colors ${
                  activeTab === item.id ? 
                    `${isHexColor ? '' : `bg-${primaryColor.replace('600', '50')}`} ${textColorClass} border-r-4 ${borderColorClass}` : 
                    ''
                }`}
                style={
                  activeTab === item.id ? 
                    (isHexColor ? { 
                      ...hexStyles.hoverBg, 
                      ...hexStyles.textColor,
                      borderRightWidth: '4px',
                      ...hexStyles.borderColor
                    } : {}) : 
                    {}
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          
          {/* User info and logout button */}
          {user && onLogout && (
            <div className="mt-auto border-t border-gray-200 pt-4 pb-2 px-4">
              <div className="mb-2 text-sm text-gray-600">
                <span className="block font-medium">{user.name || user.email}</span>
                <span className="block text-xs opacity-75">{user.role}</span>
              </div>
              <button
                onClick={onLogout}
                className={`w-full flex items-center px-4 py-2 text-gray-700 rounded-md ${hoverBgColorClass} ${hoverTextColorClass} transition-colors`}
              >
                <FaSignOutAlt className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Overlay for mobile - Only shown if responsive is true */}
      {responsive && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
}

export default Sidebar;
