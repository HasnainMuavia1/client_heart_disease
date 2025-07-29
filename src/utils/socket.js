import io from 'socket.io-client';

/**
 * Socket.io client instance
 */
let socket;

/**
 * Initialize the Socket.io connection
 * @param {string} token - Authentication token
 * @returns {Object} Socket.io client instance
 */
export const initSocket = (token) => {
  // Close existing connection if any
  if (socket) {
    socket.disconnect();
  }
  
  // Create new connection with authentication
  socket = io('http://localhost:5000', {
    auth: {
      token
    }
  });
  
  // Setup default event listeners
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  return socket;
};

/**
 * Get the existing Socket.io instance
 * @returns {Object} Socket.io client instance
 * @throws {Error} If socket is not initialized
 */
export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket first.');
  }
  return socket;
};

/**
 * Join a chat room
 * @param {string} chatId - ID of the chat to join
 */
export const joinChatRoom = (chatId) => {
  const socket = getSocket();
  socket.emit('joinChat', { chatId });
};

/**
 * Leave a chat room
 * @param {string} chatId - ID of the chat to leave
 */
export const leaveChatRoom = (chatId) => {
  const socket = getSocket();
  socket.emit('leaveChat', { chatId });
};

/**
 * Send a message in a chat
 * @param {string} chatId - ID of the chat
 * @param {string} content - Message content
 */
export const sendMessage = (chatId, content) => {
  const socket = getSocket();
  socket.emit('sendMessage', { chatId, content });
};

/**
 * Mark a message as read
 * @param {string} messageId - ID of the message to mark as read
 */
export const markMessageAsRead = (messageId) => {
  const socket = getSocket();
  socket.emit('markRead', { messageId });
};

export default {
  initSocket,
  getSocket,
  joinChatRoom,
  leaveChatRoom,
  sendMessage,
  markMessageAsRead
};
