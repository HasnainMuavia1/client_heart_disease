import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import chatService from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

/**
 * Component for displaying a list of active chats
 */
const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const data = await chatService.getMyChats();
        setChats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Failed to load chats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Get the other participant's info from the chat
  const getRecipientInfo = (chat) => {
    const isDoctor = currentUser.is_doctor;
    const recipient = isDoctor ? chat.patient : chat.doctor;
    
    return {
      id: recipient.id,
      name: recipient.name,
      role: isDoctor ? 'Patient' : 'Doctor',
      lastMessage: chat.lastMessage?.content || 'No messages yet',
      lastMessageTime: chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : '',
      unread: chat.unreadCount || 0
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white px-4 py-3">
        <h2 className="font-semibold">Conversations</h2>
      </div>
      
      <div className="divide-y">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : chats.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No active conversations found.
          </div>
        ) : (
          chats.map((chat) => {
            const recipient = getRecipientInfo(chat);
            
            return (
              <div 
                key={chat.id}
                onClick={() => onSelectChat(chat.id, recipient.name, recipient.role)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{recipient.name}</h3>
                  {recipient.lastMessageTime && (
                    <span className="text-xs text-gray-500">{recipient.lastMessageTime}</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600 truncate max-w-[80%]">
                    {recipient.lastMessage}
                  </p>
                  
                  {recipient.unread > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {recipient.unread}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-1">{recipient.role}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

ChatList.propTypes = {
  onSelectChat: PropTypes.func.isRequired
};

export default ChatList;
