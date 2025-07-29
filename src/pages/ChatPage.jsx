import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft } from 'react-icons/fi';
import ChatMessage from '../components/ChatMessage';
import chatService from '../services/chatService';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isDoctor, setIsDoctor] = useState(false);

  // Fetch user data and determine if they are a doctor
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }
        
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setUser(userData.data);
        setIsDoctor(userData.data.role === 'doctor');
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      }
    };
    
    fetchUserData();
  }, [navigate]);

  // Fetch chat messages
  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!chatId) return;
      
      try {
        setLoading(true);
        const response = await chatService.getChatMessages(chatId);
        setMessages(response.data || []);
        
        // Get chat info from the first message or from active chats
        if (response.data && response.data.length > 0) {
          const firstMessage = response.data[0];
          setChatInfo({
            patientName: firstMessage.patientName || 'Patient',
            doctorName: firstMessage.doctorName || 'Doctor',
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chat messages:', err);
        setError('Failed to load chat messages');
        setLoading(false);
      }
    };
    
    fetchChatMessages();
    
    // Set up polling for new messages every 10 seconds
    const interval = setInterval(() => {
      fetchChatMessages();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      await chatService.sendMessage(chatId, newMessage);
      setNewMessage('');
      
      // Fetch updated messages
      const response = await chatService.getChatMessages(chatId);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate(isDoctor ? '/doctor-dashboard' : '/patient-dashboard');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat header */}
      <div className="bg-white shadow-md p-4 flex items-center">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100 mr-2"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-semibold">
            {isDoctor 
              ? chatInfo?.patientName || 'Patient' 
              : chatInfo?.doctorName || 'Doctor'}
          </h2>
          <p className="text-sm text-gray-500">
            {isDoctor ? 'Patient' : 'Doctor'}
          </p>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
            <p className="ml-2 text-gray-600">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage 
                key={message._id} 
                message={message} 
                isDoctor={isDoctor} 
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="bg-red-600 text-white rounded-r-lg px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
