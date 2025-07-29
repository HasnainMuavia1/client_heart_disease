import { io } from "socket.io-client";

let socket;

/**
 * Service for Socket.io connections and events
 */
const socketService = {
  /**
   * Initialize the socket connection
   * @returns {Object} Socket instance
   */
  initSocket: () => {
    if (socket) return socket;

    const token = localStorage.getItem("access_token");

    // Connect to the socket server with authentication
    socket = io("http://localhost:5000", {
      auth: {
        token,
      },
    });

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return socket;
  },

  /**
   * Join a specific chat room
   * @param {string} chatId - ID of the chat to join
   */
  joinChat: (chatId) => {
    if (!socket) return;
    socket.emit("joinChat", { chatId });
  },

  /**
   * Leave a specific chat room
   * @param {string} chatId - ID of the chat to leave
   */
  leaveChat: (chatId) => {
    if (!socket) return;
    socket.emit("leaveChat", { chatId });
  },

  /**
   * Send a message in a specific chat
   * @param {string} chatId - ID of the chat
   * @param {string} content - Message content
   */
  sendMessage: (chatId, content) => {
    if (!socket) return;
    socket.emit("sendMessage", { chatId, content });
  },

  /**
   * Mark messages in a chat as read
   * @param {string} chatId - ID of the chat
   */
  markAsRead: (chatId) => {
    if (!socket) return;
    socket.emit("markAsRead", { chatId });
  },

  /**
   * Listen for new messages
   * @param {Function} callback - Callback function to handle new messages
   */
  onNewMessage: (callback) => {
    if (!socket) return;
    socket.on("newMessage", callback);
  },

  /**
   * Listen for message read status updates
   * @param {Function} callback - Callback function to handle read status updates
   */
  onMessageRead: (callback) => {
    if (!socket) return;
    socket.on("messageRead", callback);
  },

  /**
   * Listen for chat updates (new chats, status changes)
   * @param {Function} callback - Callback function to handle chat updates
   */
  onChatUpdate: (callback) => {
    if (!socket) return;
    socket.on("chatUpdate", callback);
  },

  /**
   * Remove all listeners and disconnect socket
   */
  disconnect: () => {
    if (!socket) return;
    socket.off();
    socket.disconnect();
    socket = null;
  },
};

export default socketService;
