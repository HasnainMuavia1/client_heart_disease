import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatList from '../components/chat/ChatList';
import ChatInterface from '../components/chat/ChatInterface';
import chatService from '../services/chatService';

/**
 * Main chat page component
 */
const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientRole, setRecipientRole] = useState('');
  const [chatRequests, setChatRequests] = useState([]);
  // Loading state used in UI to show loading indicators
  const [isLoading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const isDoctor = currentUser?.is_doctor;

  // Fetch chat requests
  useEffect(() => {
    const fetchChatRequests = async () => {
      try {
        setLoading(true);
        const requests = isDoctor 
          ? await chatService.getDoctorChatRequests()
          : await chatService.getPatientChatRequests();
        setChatRequests(requests);
      } catch (error) {
        console.error('Error fetching chat requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRequests();
  }, [isDoctor]);

  // Handle selecting a chat
  const handleSelectChat = (chatId, name, role) => {
    setSelectedChat(chatId);
    setRecipientName(name);
    setRecipientRole(role);
  };

  // Handle approving a chat request (for doctors)
  const handleApproveRequest = async (patientId) => {
    try {
      await chatService.approveChatRequest(patientId);
      // Refresh chat requests
      const requests = await chatService.getDoctorChatRequests();
      setChatRequests(requests);
    } catch (error) {
      console.error('Error approving chat request:', error);
    }
  };

  // Handle rejecting a chat request (for doctors)
  const handleRejectRequest = async (patientId) => {
    try {
      await chatService.rejectChatRequest(patientId);
      // Refresh chat requests
      const requests = await chatService.getDoctorChatRequests();
      setChatRequests(requests);
    } catch (error) {
      console.error('Error rejecting chat request:', error);
    }
  };

  // We'll use this function in the doctor search section below
  const handleSendChatRequest = async (doctorId) => {
    try {
      await chatService.sendChatRequest(doctorId);
      // Refresh chat requests
      const requests = await chatService.getPatientChatRequests();
      setChatRequests(requests);
    } catch (error) {
      console.error('Error sending chat request:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chat</h1>
      
      {/* Chat requests section (for doctors) */}
      {/* Display loading indicator when fetching data */}
      {isLoading && (
        <div className="flex justify-center items-center py-8 mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Chat requests section for doctors */}
      {isDoctor && chatRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Chat Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chatRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-medium">{request.patient.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Requested: {new Date(request.createdAt).toLocaleDateString()}
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleApproveRequest(request.patient.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.patient.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Chat requests status (for patients) */}
      {!isDoctor && chatRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Your Chat Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chatRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-medium">Dr. {request.doctor.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Requested: {new Date(request.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm mt-2">
                  Status: 
                  <span className={`ml-1 font-medium ${
                    request.status === 'pending' ? 'text-yellow-500' :
                    request.status === 'approved' ? 'text-green-500' :
                    'text-red-500'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Doctor search section (for patients) */}
      {!isDoctor && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Find a Doctor</h2>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search for doctors..."
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sample doctor cards - in a real app, these would be populated from an API */}
              <div className="border rounded-lg p-3">
                <h3 className="font-medium">Dr. John Smith</h3>
                <p className="text-sm text-gray-600">Cardiologist</p>
                <button
                  onClick={() => handleSendChatRequest('doctor-id-1')}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
                >
                  Request Chat
                </button>
              </div>
              <div className="border rounded-lg p-3">
                <h3 className="font-medium">Dr. Sarah Johnson</h3>
                <p className="text-sm text-gray-600">Neurologist</p>
                <button
                  onClick={() => handleSendChatRequest('doctor-id-2')}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 text-sm"
                >
                  Request Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main chat interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ChatList onSelectChat={handleSelectChat} />
        </div>
        
        <div className="md:col-span-2">
          {selectedChat ? (
            <ChatInterface 
              chatId={selectedChat} 
              recipientName={recipientName}
              recipientRole={recipientRole}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center h-full flex flex-col justify-center items-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No chat selected</h3>
              <p className="text-gray-500">Select a conversation from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
