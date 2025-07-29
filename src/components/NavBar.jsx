import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { FaStethoscope } from "react-icons/fa";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="relative flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 z-10">
            <FaStethoscope className="w-6 h-6 text-red-600" />
            <span className="text-xl font-bold text-red-600">DocTalk</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden z-10 text-gray-700 hover:text-red-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>

          {/* Navigation Links - Mobile & Desktop */}
          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } md:flex absolute md:relative top-0 left-0 right-0 flex-col md:flex-row items-center justify-center md:justify-end w-full md:w-auto bg-white md:bg-transparent pt-20 md:pt-0 pb-6 md:pb-0 space-y-4 md:space-y-0 md:space-x-4`}
          >
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/doctors" onClick={() => setIsMenuOpen(false)}>
                Doctors
              </NavLink>
              <NavLink to="/submit-report" onClick={() => setIsMenuOpen(false)}>
                Submit Report
              </NavLink>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
              <Link
                to="/signin"
                className="w-full md:w-auto"
                onClick={() => setIsMenuOpen(false)}
              >
                <button className="w-full md:w-auto px-6 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                  Sign In
                </button>
              </Link>

              <Link
                to="/signup"
                className="w-full md:w-auto"
                onClick={() => setIsMenuOpen(false)}
              >
                <button className="w-full md:w-auto px-6 py-2 text-sm border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-2 text-sm text-gray-700 hover:text-red-600 relative group w-full md:w-auto text-center"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 transform scale-x-0 transition-transform group-hover:scale-x-100" />
  </Link>
);

export default NavBar;
