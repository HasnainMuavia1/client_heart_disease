import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import reportService from "../services/reportService";
import { authService } from "../services/authService";
import chatService from "../services/chatService";
import socketService from "../services/socketService";
// Import components
import Header from "../components/dashboard/Header";
import Navigation from "../components/dashboard/Navigation";
import DashboardTab from "../components/dashboard/DashboardTab";
import ReportsTab from "../components/dashboard/ReportsTab";
import ProfileTab from "../components/dashboard/ProfileTab";
import PredictionTab from "../components/dashboard/PredictionTab";
import ReportModal from "../components/dashboard/ReportModal";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Report form state
  const [reportFile, setReportFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSeverity, setReportSeverity] = useState("medium");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // ECG prediction state
  const [isEcgPrediction, setIsEcgPrediction] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // Chat state
  const [chatRequests, setChatRequests] = useState([]);
  const [chatRequestsLoading, setChatRequestsLoading] = useState(false);
  const [chatRequestsError, setChatRequestsError] = useState("");
  const [activeChats, setActiveChats] = useState([]);
  const [activeChatsLoading, setActiveChatsLoading] = useState(false);
  const [activeChatsError, setActiveChatsError] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessagesLoading, setChatMessagesLoading] = useState(false);
  const [chatMessagesError, setChatMessagesError] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Socket reference
  const socketRef = useRef(null);

  // Reference for message container to enable auto-scrolling
  const messagesContainerRef = useRef(null);

  // Effect to handle auto-scrolling whenever messages change
  useEffect(() => {
    if (chatMessages?.length > 0 && messagesContainerRef.current) {
      const scrollToBottom = () => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      };

      // Try multiple times to ensure scroll happens after DOM updates
      scrollToBottom();
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
      setTimeout(scrollToBottom, 500); // Added longer timeout for slower devices
      setTimeout(scrollToBottom, 1000); // Added even longer timeout for very slow devices

      // Mark messages as read when viewed
      if (selectedChat) {
        socketService.markAsRead(selectedChat._id);
      }
    }
  }, [chatMessages, selectedChat]);

  // Handle file selection for report upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportFile(file);
      setFileName(file.name);
      // Reset prediction result when file changes
      setPredictionResult(null);
    }
  };

  // Handle report file submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (!reportFile) {
      setSubmitError("Please select a file to upload");
      return;
    }

    if (!reportTitle.trim()) {
      setSubmitError("Please enter a report title");
      return;
    }

    // For ECG prediction uploads, ensure we have prediction results
    if (isEcgPrediction && !predictionResult) {
      setSubmitError("Please get ECG prediction results before submitting");
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError("");

      // Prepare additional metadata for ECG prediction reports
      let additionalMetadata = {};
      
      if (isEcgPrediction && predictionResult) {
        additionalMetadata = {
          ecgPrediction: predictionResult.prediction,
          ecgConfidence: predictionResult.confidence,
          isEcgReport: true
        };
        
        // Add prediction result to the description if it's an ECG report
        const predictionDescription = `ECG Analysis: ${predictionResult.prediction} (Confidence: ${(predictionResult.confidence * 100).toFixed(2)}%)`;
        const fullDescription = reportDescription 
          ? `${reportDescription}\n\n${predictionDescription}` 
          : predictionDescription;
          
        setReportDescription(fullDescription);
      }

      // Upload the report
      await reportService.uploadReport(
        reportFile,
        reportTitle,
        reportDescription,
        reportSeverity,
        additionalMetadata
      );

      // Clear form fields
      setReportFile(null);
      setFileName("");
      setReportTitle("");
      setReportDescription("");
      setReportSeverity("medium");
      setIsEcgPrediction(false);
      setPredictionResult(null);

      // Show success message
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);

      // Close modal
      setIsModalOpen(false);

      // Refresh reports list
      fetchReports();
    } catch (error) {
      console.error("Error submitting report:", error);
      setSubmitError(error || "Failed to submit report. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Fetch reports when switching to reports tab
    if (tab === "reports") {
      fetchReports();
    }

    // Fetch fresh user data when switching to profile tab
    if (tab === "profile") {
      fetchUserProfile();
    }
  };

  // Initial data loading and authentication check
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Fetch user data
        const userData = await authService.fetchUserData();
        const userInfo = userData?.data;
        setUser(userInfo);

        // Check if user has admin role and redirect if needed
        if (userInfo?.role === "admin") {
          console.log("Admin user detected, redirecting to admin dashboard");
          navigate("/admin-dashboard");
          return;
        }

        // Fetch initial data based on active tab
        if (activeTab === "reports") {
          fetchReports();
        } else if (activeTab === "chats") {
          fetchChatRequests();
          fetchActiveChats();
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        // Set loading to false regardless of success/failure
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, []); // Empty dependency array means this runs once on mount

  // Initialize socket connection as soon as user is loaded
  useEffect(() => {
    // Only initialize socket if user is loaded
    if (!user) return;
    
    // Skip socket initialization for admin users
    if (user.role === 'admin') {
      console.log('Admin user detected, skipping chat initialization');
      return;
    }

    console.log("Initializing socket connection for user:", user._id);

    // Initialize socket connection
    socketRef.current = socketService.initSocket();

    // Set up socket event listeners for real-time updates
    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully");
    });

    // Listen for chat updates (new chats, status changes)
    socketService.onChatUpdate(() => {
      console.log("Chat update received, refreshing chats");
      fetchActiveChats();
      fetchChatRequests();
    });

    // Fetch initial chat data
    fetchChatRequests();
    fetchActiveChats();

    // Cleanup function
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // Per-chat useEffect for handling messages in the selected chat
  useEffect(() => {
    if (!selectedChat || !socketRef.current) return;

    const chatId = selectedChat._id;
    console.log("Setting up listeners for chat:", chatId);

    // Join the chat room
    socketService.joinChat(chatId);

    // Listen for new messages
    socketService.onNewMessage(({ chatId: incomingChatId, message }) => {
      console.log("📥 Received new message:", message);

      // Always update active chats list
      fetchActiveChats();

      if (incomingChatId === chatId) {
        // Update messages in the current chat
        setChatMessages((prevMessages) => {
          // Handle different message structures
          if (Array.isArray(prevMessages)) {
            // Filter out any temporary messages with the same content
            const filteredMessages = prevMessages.filter(
              (msg) => !(msg.isTemp && msg.content === message.content)
            );
            return [...filteredMessages, message];
          } else if (prevMessages && prevMessages.messages) {
            // Filter out any temporary messages with the same content
            const filteredMessages = prevMessages.messages.filter(
              (msg) => !(msg.isTemp && msg.content === message.content)
            );
            return {
              ...prevMessages,
              messages: [...filteredMessages, message],
            };
          } else {
            // Initialize with the new message if no previous messages
            return { messages: [message] };
          }
        });

        // Mark messages as read
        socketService.markAsRead(chatId);
      }
    });

    // Listen for message read status updates
    socketService.onMessageRead((data) => {
      console.log("Message read status updated:", data);
      if (data.chatId === chatId) {
        // Update read status of messages
        setChatMessages((prevMessages) => {
          if (Array.isArray(prevMessages)) {
            return prevMessages.map((msg) => ({
              ...msg,
              read: true,
            }));
          } else if (prevMessages && prevMessages.messages) {
            return {
              ...prevMessages,
              messages: prevMessages.messages.map((msg) => ({
                ...msg,
                read: true,
              })),
            };
          }
          return prevMessages;
        });
      }
    });

    // Cleanup function - remove listeners and leave chat
    return () => {
      console.log("Cleaning up listeners for chat:", chatId);
      socketService.leaveChat(chatId);
      socketRef.current.off("newMessage"); // remove old listener to prevent duplication
      socketRef.current.off("messageRead");
    };
  }, [selectedChat]);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
    } else if (activeTab === "chats") {
      fetchChatRequests();
      fetchActiveChats();
    }
  }, [activeTab]);

  // Fetch fresh user data from server
  const fetchUserProfile = async () => {
    try {
      const userData = await authService.fetchUserData();
      console.log(userData);
      setUser(userData?.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Fetch all reports for the current user
  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      setReportsError("");
      const data = await reportService.getMyReports();
      console.log("Fetched reports:", data);
      
      // Process the reports to ensure prediction data is properly structured
      const processedReports = (data?.data || []).map(report => {
        // If report has metadata with ECG prediction, make it accessible at the top level
        if (report.metadata && report.metadata.isEcgReport) {
          return {
            ...report,
            isEcgReport: true,
            ecgPrediction: report.metadata.ecgPrediction,
            ecgConfidence: report.metadata.ecgConfidence
          };
        }
        return report;
      });
      
      setReports(processedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReportsError("Failed to load reports. Please try again.");
    } finally {
      setReportsLoading(false);
    }
  };

  // Fetch a specific report by ID and its nearby doctors
  const fetchReportDetails = async (reportId) => {
    try {
      const reportData = await reportService.getReport(reportId);
      setSelectedReport(reportData?.data);

      // Fetch nearby doctors for this report
      setDoctorsLoading(true);
      try {
        const doctors = await reportService.findDoctorsForReport(reportId);
        setNearbyDoctors(doctors?.data || []);
      } catch (error) {
        console.error("Error fetching nearby doctors:", error);
      } finally {
        setDoctorsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
    }
  };

  // Fetch chat requests sent by the user
  const fetchChatRequests = async () => {
    setChatRequestsLoading(true);
    setChatRequestsError("");
    try {
      const response = await chatService.getPatientChatRequests();
      if (response && response.success && Array.isArray(response.data)) {
        setChatRequests(response.data);
      } else {
        setChatRequests(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error("Error fetching chat requests:", error);
      setChatRequestsError("Failed to load chat requests. Please try again.");
    } finally {
      setChatRequestsLoading(false);
    }
  };

  // Fetch active chats for the user
  const fetchActiveChats = async () => {
    setActiveChatsLoading(true);
    setActiveChatsError("");
    try {
      const response = await chatService.getMyChats();
      if (response && response.success && Array.isArray(response.data)) {
        setActiveChats(response.data);
      } else {
        setActiveChats(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error("Error fetching active chats:", error);
      setActiveChatsError("Failed to load active chats. Please try again.");
    } finally {
      setActiveChatsLoading(false);
    }
  };

  // Fetch messages for a specific chat
  const fetchChatMessages = async (chatId) => {
    setChatMessagesLoading(true);
    setChatMessagesError("");
    try {
      const response = await chatService.getChatMessages(chatId);
      if (response && response.success && Array.isArray(response.data)) {
        setChatMessages(response.data);
      } else {
        setChatMessages(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      setChatMessagesError("Failed to load chat messages. Please try again.");
    } finally {
      setChatMessagesLoading(false);
    }
  };

  // Handle selecting a chat to view messages
  const handleSelectChat = async (chat) => {
    console.log("Selecting chat:", chat._id);

    // Leave previous chat room if any
    if (selectedChat) {
      console.log("Leaving previous chat room:", selectedChat._id);
      socketService.leaveChat(selectedChat._id);
    }

    setSelectedChat(chat);
    setChatMessagesLoading(true);
    setChatMessagesError("");

    try {
      // Ensure socket is initialized before joining chat
      if (!socketRef.current) {
        console.log("Initializing socket before joining chat");
        socketRef.current = socketService.initSocket();
      }

      // Join the new chat room immediately
      console.log("Joining chat room:", chat._id);
      socketService.joinChat(chat._id);

      // Then fetch messages
      const messages = await chatService.getChatMessages(chat._id);
      setChatMessages(messages?.data || { messages: [] });

      // Mark messages as read
      socketService.markAsRead(chat._id);

      // Force scroll to bottom after loading messages
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 300);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      setChatMessagesError("Failed to load messages. Please try again.");
    } finally {
      setChatMessagesLoading(false);
    }
  };
  // Effect to handle auto-scrolling whenever messages change
  useEffect(() => {
    if (
      messagesContainerRef.current &&
      ((Array.isArray(chatMessages) && chatMessages.length > 0) ||
        (chatMessages?.messages && chatMessages.messages.length > 0))
    ) {
      // Multiple scroll attempts for reliability
      const scrollToBottom = () => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      };

      // Immediate scroll
      scrollToBottom();

      // Delayed scrolls for when images or content might affect height
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
      setTimeout(scrollToBottom, 500);
    }
  }, [chatMessages]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-t-transparent"></div>
          <p className="mt-3 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-2 text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header
        user={user}
        handleLogout={() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          navigate("/signin");
        }}
      />

      {/* Navigation */}
      <Navigation activeTab={activeTab} handleTabChange={handleTabChange} />

      {/* Main Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <DashboardTab 
              handleTabChange={handleTabChange} 
              reports={reports} 
              user={user} 
            />
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <ReportsTab
              reports={reports}
              reportsLoading={reportsLoading}
              reportsError={reportsError}
              selectedReport={selectedReport}
              nearbyDoctors={nearbyDoctors}
              doctorsLoading={doctorsLoading}
              fetchReportDetails={fetchReportDetails}
              setSelectedReport={setSelectedReport}
              setIsModalOpen={setIsModalOpen}
            />
          )}

          {/* Predictions Tab */}
          {activeTab === "predictions" && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Health Predictions
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  This feature is coming soon. Stay tuned for health predictions
                  based on your reports.
                </p>
              </div>
            </div>
          )}

          {/* Chats Tab */}
          {activeTab === "chats" && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  My Chats
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Chat with healthcare professionals about your reports.
                </p>
              </div>

              <div className="border-t border-gray-200">
                {/* Chat Requests Section */}
                <div className="px-4 py-5 sm:px-6">
                  <h4 className="text-md font-medium text-gray-900">
                    Chat Requests
                  </h4>

                  {chatRequestsLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">
                        Loading chat requests...
                      </p>
                    </div>
                  )}

                  {chatRequestsError && (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-600">
                        {chatRequestsError}
                      </p>
                      <button
                        onClick={fetchChatRequests}
                        className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!chatRequestsLoading &&
                    !chatRequestsError &&
                    chatRequests.length === 0 && (
                      <p className="text-sm text-gray-500 py-4">
                        No pending chat requests.
                      </p>
                    )}

                  {!chatRequestsLoading &&
                    !chatRequestsError &&
                    chatRequests.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {chatRequests.map((request) => (
                          <div
                            key={request._id}
                            className="border border-gray-200 rounded-md p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">
                                  Dr.{" "}
                                  {request.doctor?.first_name ||
                                    request.doctor?.name ||
                                    "Unknown"}{" "}
                                  {request.doctor?.last_name || ""}
                                </h5>
                                <p className="text-xs text-gray-500">
                                  {request.doctor?.specialization ||
                                    "Specialist"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Requested on{" "}
                                  {new Date(
                                    request.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  request.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : request.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {request.status === "approved"
                                  ? "Approved"
                                  : request.status === "rejected"
                                  ? "Rejected"
                                  : "Pending"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Active Chats Section */}
                <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900">
                    Active Chats
                  </h4>

                  {activeChatsLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">
                        Loading active chats...
                      </p>
                    </div>
                  )}

                  {activeChatsError && (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-600">{activeChatsError}</p>
                      <button
                        onClick={fetchActiveChats}
                        className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!activeChatsLoading &&
                    !activeChatsError &&
                    activeChats.length === 0 && (
                      <p className="text-sm text-gray-500 py-4">
                        No active chats. Send a chat request to a doctor to
                        start a conversation.
                      </p>
                    )}

                  {!activeChatsLoading &&
                    !activeChatsError &&
                    activeChats.length > 0 && (
                      <div className="mt-4 flex flex-col md:flex-row">
                        {/* Chat List */}
                        <div className="w-full md:w-1/3 pr-0 md:pr-4 mb-4 md:mb-0">
                          <div className="border border-gray-200 rounded-md overflow-hidden">
                            {activeChats.map((chat) => (
                              <div
                                key={chat._id}
                                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                                  selectedChat && selectedChat._id === chat._id
                                    ? "bg-red-50"
                                    : ""
                                }`}
                                onClick={() => handleSelectChat(chat)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900">
                                      Dr.{" "}
                                      {chat.doctor?.first_name ||
                                        chat.doctor?.name ||
                                        "Unknown"}{" "}
                                      {chat.doctor?.last_name || ""}
                                    </h5>
                                    <p className="text-xs text-gray-500">
                                      {chat.doctor?.specialization ||
                                        "Specialist"}
                                    </p>
                                    {chat.lastMessage && (
                                      <p className="text-xs text-gray-500 mt-1 truncate">
                                        {chat.lastMessage.content}
                                      </p>
                                    )}
                                  </div>
                                  {chat.unreadCount > 0 && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      {chat.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="w-full md:w-2/3 border border-gray-200 rounded-md">
                          {!selectedChat ? (
                            <div className="h-96 flex items-center justify-center">
                              <p className="text-gray-500">
                                Select a chat to view messages
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col h-96">
                              {/* Chat Header */}
                              <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h5 className="text-sm font-medium text-gray-900">
                                  Dr.{" "}
                                  {selectedChat.doctor?.first_name ||
                                    selectedChat.doctor?.name ||
                                    "Unknown"}{" "}
                                  {selectedChat.doctor?.last_name || ""}
                                </h5>
                                <p className="text-xs text-gray-500">
                                  {selectedChat.doctor?.specialization ||
                                    "Specialist"}
                                </p>
                              </div>

                              {/* Messages */}
                              <div
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto p-4"
                              >
                                {chatMessagesLoading ? (
                                  <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                                  </div>
                                ) : chatMessagesError ? (
                                  <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-red-600">
                                      {chatMessagesError}
                                    </p>
                                  </div>
                                ) : !chatMessages ||
                                  (!Array.isArray(chatMessages) &&
                                    !chatMessages.messages) ? (
                                  <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-gray-500">
                                      No messages yet. Start the conversation!
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {(Array.isArray(chatMessages)
                                      ? chatMessages
                                      : chatMessages?.messages || []
                                    ).map((message) => (
                                      <div
                                        key={message._id}
                                        className={`flex ${
                                          message.sender === user?._id
                                            ? "justify-end"
                                            : "justify-start"
                                        }`}
                                      >
                                        <div
                                          className={`max-w-xs px-4 py-2 rounded-lg ${
                                            message.sender === user?._id
                                              ? "bg-red-100 text-red-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          <p className="text-sm">
                                            {message.content}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {new Date(
                                              message.timestamp
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Message Input */}
                              <div className="p-4 border-t border-gray-200">
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();

                                    if (!newMessage.trim() || !selectedChat)
                                      return;

                                    // Create a temporary message object for optimistic UI
                                    const tempMessage = {
                                      _id: Date.now().toString(),
                                      sender: user?._id,
                                      content: newMessage,
                                      timestamp: new Date().toISOString(),
                                      read: false,
                                      isTemp: true, // Flag to identify temporary messages
                                    };

                                    // Add to UI immediately for better UX
                                    setChatMessages((prevMessages) => {
                                      if (Array.isArray(prevMessages)) {
                                        return [...prevMessages, tempMessage];
                                      } else if (
                                        prevMessages &&
                                        prevMessages.messages
                                      ) {
                                        return {
                                          ...prevMessages,
                                          messages: [
                                            ...prevMessages.messages,
                                            tempMessage,
                                          ],
                                        };
                                      } else {
                                        return { messages: [tempMessage] };
                                      }
                                    });

                                    // Clear input
                                    setNewMessage("");

                                    try {
                                      // Send via socket
                                      socketService.sendMessage(
                                        selectedChat._id,
                                        newMessage
                                      );

                                      // Force scroll to bottom after sending
                                      setTimeout(() => {
                                        if (messagesContainerRef.current) {
                                          messagesContainerRef.current.scrollTop =
                                            messagesContainerRef.current.scrollHeight;
                                        }
                                      }, 100);
                                    } catch (error) {
                                      console.error(
                                        "Error sending message:",
                                        error
                                      );

                                      // Show error
                                      setChatMessagesError(
                                        "Failed to send message. Please try again."
                                      );

                                      // Clear error after 3 seconds
                                      setTimeout(
                                        () => setChatMessagesError(""),
                                        3000
                                      );
                                    }
                                  }}
                                  className="flex"
                                >
                                  <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) =>
                                      setNewMessage(e.target.value)
                                    }
                                    placeholder="Type a message..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                                  />
                                  <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-r-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                  >
                                    Send
                                  </button>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Predictions Tab */}
          {activeTab === "predictions" && (
            <PredictionTab 
              reports={reports} 
              reportsLoading={reportsLoading} 
              reportsError={reportsError} 
            />
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && <ProfileTab user={user} />}
        </div>
      </main>

      {/* Report Modal */}
      <ReportModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        reportTitle={reportTitle}
        setReportTitle={setReportTitle}
        reportDescription={reportDescription}
        setReportDescription={setReportDescription}
        reportSeverity={reportSeverity}
        setReportSeverity={setReportSeverity}
        fileName={fileName}
        handleFileChange={handleFileChange}
        handleSubmitReport={handleSubmitReport}
        submitLoading={submitLoading}
        submitError={submitError}
        submitSuccess={submitSuccess}
        isEcgPrediction={isEcgPrediction}
        setIsEcgPrediction={setIsEcgPrediction}
        predictionResult={predictionResult}
        setPredictionResult={setPredictionResult}
        reportFile={reportFile}
      />
    </div>
  );
};

export default UserDashboard;
