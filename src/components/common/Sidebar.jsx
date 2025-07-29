import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

/**
 * Reusable Sidebar component that can be configured for different user roles
 * @param {Object} props
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.setActiveTab - Function to set active tab
 * @param {Array} props.menuItems - Array of menu items with id, label, and icon
 * @param {string} props.title - Title displayed at the top of sidebar
 * @param {string} props.primaryColor - Primary color for active items and header (hex or tailwind class name)
 * @param {boolean} props.responsive - Whether sidebar should be responsive (collapsible on mobile)
 */
function Sidebar({ 
  activeTab, 
  setActiveTab, 
  menuItems, 
  title, 
  primaryColor = 'red-600', 
  responsive = true 
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
        <nav className="mt-6">
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
