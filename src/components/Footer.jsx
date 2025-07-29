import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-red-800 text-white pt-8 pb-4">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-around items-start gap-8 space-x-16 md:space-y-0">
        {/* Left Side: Company Info */}
        <div className="w-full md:w-1/3 space-y-4">
          <h2 className="text-2xl font-bold mb-2">
            Heart Disease Prediction System
          </h2>
          <p className="text-sm">
            We provide accurate heart disease risk predictions using advanced
            algorithms to help individuals maintain and improve their heart
            health.
          </p>
        </div>

        {/* Middle: Quick Links */}
        <div className="w-full md:w-1/3 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#home" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="#services" className="hover:underline">
                Our Services
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:underline">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Right Side: Follow Us */}
        <div className="w-full md:w-1/3 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Follow Us</h3>
          <div className="flex space-x-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center w-10 h-10 border border-white rounded-full hover:text-red-300"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center w-10 h-10 border border-white rounded-full hover:text-red-300"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center w-10 h-10 border border-white rounded-full hover:text-red-300"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom: Copyright */}
      <div className="mt-8 text-center text-sm">
        &copy; {new Date().getFullYear()} Heart Disease Prediction System. All
        rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
