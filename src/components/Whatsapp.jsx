import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppFloat = () => {
  return (
    <a
      href="https://wa.me/1234567890" 
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 flex items-center gap-3 bg-[#25D366] text-white p-4 rounded-[24px] shadow-lg hover:bg-[#1ea952] transition-all duration-300 ease-in-out transform hover:-translate-y-1 z-50 group min-w-[200px]"
    >
      <div className="relative flex items-center gap-2">
        <div className="bg-white rounded-full p-2">
          <FaWhatsapp className="text-2xl text-[#25D366]" />
        </div>
        <span className="font-semibold">Chat with us</span>
      </div>
      
      {/* Animated dots for typing effect */}
      <div className="flex gap-1 ml-auto">
        <span className="animate-pulse delay-0 h-2 w-2 bg-white rounded-full"></span>
        <span className="animate-pulse delay-150 h-2 w-2 bg-white rounded-full"></span>
        <span className="animate-pulse delay-300 h-2 w-2 bg-white rounded-full"></span>
      </div>
    </a>
  );
};

export default WhatsAppFloat;

