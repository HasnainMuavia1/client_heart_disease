import { useState, useEffect, useRef } from "react";
import ReportsTable from "../components/doctor-dashboard/ReportsTable";
import {
  FaHome,
  FaClipboardList,
  FaUserCircle,
  FaCalendarAlt,
  FaUserMd,
  FaChartBar,
  FaHospital,
  FaMapMarkerAlt,
  FaSave,
  FaComments,
} from "react-icons/fa";
import { MdAnalytics } from "react-icons/md";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import doctorService from "../services/doctorService";
import chatService from "../services/chatService";
import socketService from "../services/socketService";
import reportService from "../services/reportService";
import appointmentService from "../services/appointmentService";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Map marker click handler component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>You selected this location</Popup>
    </Marker>
  ) : null;
}

// Default initial stats
const initialStats = {
  totalReports: 0,
  totalPatients: 0,
  totalAppointments: 0,
  rating: "0.0",
};

function DoctorDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointmentTab, setAppointmentTab] = useState("requests");
  const navigate = useNavigate();

  // Dashboard data state
  const [stats, setStats] = useState(initialStats);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  // Chat requests state
  const [chatRequests, setChatRequests] = useState([]);
  const [chatRequestsLoading, setChatRequestsLoading] = useState(false);
  const [chatRequestsError, setChatRequestsError] = useState("");
  const [activeChats, setActiveChats] = useState([]);
  const [activeChatsLoading, setActiveChatsLoading] = useState(false);
  const [activeChatsError, setActiveChatsError] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({ messages: [] });
  const [chatMessagesLoading, setChatMessagesLoading] = useState(false);
  const [chatMessagesError, setChatMessagesError] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Socket reference
  const socketRef = useRef(null);

  // Reference for message container to enable auto-scrolling
  const messagesContainerRef = useRef(null);

  // Effect to handle auto-scrolling whenever messages change
  useEffect(() => {
    if (chatMessages?.messages?.length > 0 && messagesContainerRef.current) {
      const scrollToBottom = () => {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      };

      // Try multiple times to ensure scroll happens after DOM updates
      scrollToBottom();
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);

      // Mark all messages as read when viewed
      if (selectedChat) {
        socketService.markAsRead(selectedChat._id);
      }
    }
  }, [chatMessages, selectedChat]);

  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");

  // Call fetchDashboardData when component mounts
  useEffect(() => {
    fetchDashboardData();

    // Initialize socket connection
    socketRef.current = socketService.initSocket();

    // Setup socket event listeners
    socketService.onNewMessage((data) => {
      if (selectedChat && data.chatId === selectedChat._id) {
        setChatMessages((prevMessages) => {
          // Check if the message already exists to prevent duplicates
          const messageExists = prevMessages.messages?.some(
            (msg) => msg._id === data.message._id
          );
          
          // Only add the message if it doesn't already exist
          if (!messageExists) {
            return {
              ...prevMessages,
              messages: [...(prevMessages.messages || []), data.message],
            };
          }
          return prevMessages; // Return unchanged if message already exists
        });
        
        // Mark message as read since we're viewing this chat
        socketService.markAsRead(data.chatId);
      }

      // Update active chats to show new message preview
      fetchActiveChats();
    });

    // Listen for message read status updates
    socketService.onMessageRead((data) => {
      if (selectedChat && data.chatId === selectedChat._id) {
        // Update messages with read status
        setChatMessages((prevMessages) => {
          if (!prevMessages.messages) return prevMessages;

          const updatedMessages = prevMessages.messages.map((msg) => {
            if (!msg.read && msg.sender === user?._id) {
              return { ...msg, read: true };
            }
            return msg;
          });

          return {
            ...prevMessages,
            messages: updatedMessages,
          };
        });
      }
    });

    socketService.onChatUpdate(() => {
      // Refresh chat requests and active chats when there's an update
      fetchChatRequests();
      fetchActiveChats();
    });

    // Cleanup function
    return () => {
      if (selectedChat) {
        socketService.leaveChat(selectedChat._id);
      }
      socketService.disconnect();
    };
  }, []);

  // Effect to handle selected chat changes
  useEffect(() => {
    // If selectedChat changes, join the new chat room
    if (selectedChat) {
      socketService.joinChat(selectedChat._id);

      // Fetch chat messages when a chat is selected
      // fetchChatMessages(selectedChat._id);

      // Mark messages as read
      socketService.markAsRead(selectedChat._id);

      // Auto-scroll handled by the dedicated useEffect
    }

    return () => {
      if (selectedChat) {
        socketService.leaveChat(selectedChat._id);
      }
    };
  }, [selectedChat]);

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [locationPosition, setLocationPosition] = useState(null);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    specialization: "",
    hospital: "",
    experience_years: 0,
    bio: "",
    availableDays: [],
    availableHours: {
      start: "09:00",
      end: "17:00",
    },
    address: {
      clinic: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/me");
      const userData = response.data?.data;
      setUser(userData);
      console.log("Doctor profile data:", userData);
      
      // Check if user has admin role and redirect if needed
      if (userData?.role === 'admin') {
        console.log('Admin user detected, redirecting to admin dashboard');
        navigate('/admin-dashboard');
        return;
      }

      // Initialize profile data for editing
      setProfileData({
        first_name: response.data?.data?.name?.split(" ")[1] || "", // Assuming "Dr. Jane Smith" format
        last_name: response.data?.data?.name?.split(" ")[2] || "",
        email: response.data?.data?.email || "",
        phone_number: response.data?.data?.phone || "",
        specialization: response.data?.data?.specialization || "",
        hospital: response.data?.data?.address?.clinic || "",
        experience_years: response.data?.data?.experience || 0,
        bio: response.data?.data?.qualification || "",
        availableDays: response.data?.data?.availableDays || [],
        availableHours: response.data?.data?.availableHours || {
          start: "09:00",
          end: "17:00",
        },
        address: response.data?.data?.address || {
          clinic: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
      });

      // Set location if available
      if (response.data?.data?.location?.coordinates) {
        setLocationPosition([
          response.data?.data?.location.coordinates[1], // latitude
          response.data?.data?.location.coordinates[0], // longitude
        ]);
      } else {
        // Default location (center of map)
        setLocationPosition([31.5204, 74.3587]); // Lahore coordinates
      }

      // Load appointments from chat requests
      if (response.data.chatRequests && response.data.chatRequests.length > 0) {
        setStats((prevStats) => ({
          ...prevStats,
          totalAppointments: response.data.chatRequests.length,
        }));
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data. Please try again.");
      setLoading(false);
    }
  };
  // Initial data loading
  useEffect(() => {
    fetchUserData();
  }, []);
  
  // Initialize socket connection
  useEffect(() => {
    // Only initialize socket if user is loaded
    if (!user) return;
    
    console.log("Initializing socket connection for doctor:", user._id);
    
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

  // Fetch dashboard data (reports, stats, chat requests)
  const fetchDashboardData = async () => {
    try {
      // Fetch user data
      await fetchUserData();

      // Fetch reports data
      await fetchReportsData();

      // Fetch chat requests
      await fetchChatRequests();

      // Fetch active chats
      await fetchActiveChats();

      // Fetch stats
      // const statsData = await doctorService.getStats();
      setStats(initialStats);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    }
  };

  // Fetch chat requests
  const fetchChatRequests = async () => {
    try {
      setChatRequestsLoading(true);
      setChatRequestsError("");
      const chatRequestsData = await chatService.getDoctorChatRequests();
      setChatRequests(chatRequestsData?.data || []);
    } catch (err) {
      console.error("Error fetching chat requests:", err);
      setChatRequestsError("Failed to load chat requests");
    } finally {
      setChatRequestsLoading(false);
    }
  };

  // Fetch active chats
  const fetchActiveChats = async () => {
    try {
      setActiveChatsLoading(true);
      setActiveChatsError("");
      const activeChatsData = await chatService.getMyChats();
      setActiveChats(activeChatsData?.data || []);
    } catch (err) {
      console.error("Error fetching active chats:", err);
      setActiveChatsError("Failed to load active chats");
    } finally {
      setActiveChatsLoading(false);
    }
  };

  // Handle selecting a chat
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
      setChatMessagesError("Failed to load messages");
    } finally {
      setChatMessagesLoading(false);
    }
  };

  // Send a new message in the current chat
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      // Create a temporary message to show immediately
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content: newMessage,
        sender: user?._id,
        timestamp: new Date().toISOString(),
        read: false,
      };

      // Add the temporary message to the UI immediately
      setChatMessages((prevMessages) => ({
        ...prevMessages,
        messages: [...(prevMessages.messages || []), tempMessage],
      }));

      // Send message via Socket.io
      socketService.sendMessage(selectedChat._id, newMessage);

      // Clear input
      setNewMessage("");

      // Auto-scroll handled by the dedicated useEffect
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setSaveLoading(true);
      setSaveError("");
      setSaveSuccess(false);

      // Create the full name with "Dr." prefix
      const fullName = `Dr. ${profileData.first_name} ${profileData.last_name}`;

      // Update profile data
      await doctorService.updateProfile({
        name: fullName,
        phone: profileData.phone_number,
        specialization: profileData.specialization,
        qualification: profileData.bio, // Using bio field for qualification
        experience: profileData.experience_years,
        availableDays: profileData.availableDays,
        availableHours: profileData.availableHours,
        address: {
          clinic: profileData.hospital, // Using hospital field for clinic name
          ...profileData.address,
        },
      });

      // Update location if changed
      if (locationPosition) {
        await doctorService.updateLocation({
          coordinates: [locationPosition[1], locationPosition[0]], // [longitude, latitude]
        });
      }

      // Refresh user data
      await fetchUserData();

      setSaveSuccess(true);
      setSaveLoading(false);
      setEditingProfile(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setSaveError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
      setSaveLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Refresh data when switching to specific tabs
    if (tab === "reports") {
      fetchReportsData();
    } else if (tab === "appointments") {
      // Fetch appointment data only when switching to appointments tab
      fetchAppointmentData();
    } else if (tab === "chats") {
      // Fetch chat data when switching to chats tab
      fetchChatRequests();
      fetchActiveChats();
    }
  };

  // Fetch appointment data
  const fetchAppointmentData = async () => {
    try {
      setAppointmentsLoading(true);
      const appointmentsData = await appointmentService.getDoctorAppointments();
      if (
        appointmentsData &&
        appointmentsData.success &&
        Array.isArray(appointmentsData.data)
      ) {
        setAppointments(appointmentsData.data);
      } else {
        // If reportsData is already an array, use it directly
        setAppointments(
          Array.isArray(appointmentsData) ? appointmentsData : []
        );
      }
    } catch (err) {
      console.error("Error fetching appointment data:", err);
      setAppointmentsError("Failed to load appointments");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Fetch reports data
  const fetchReportsData = async () => {
    try {
      setReportsLoading(true);
      const reportsData = await doctorService.getReportsToReview();
      console.log(reportsData);
      // Check if reportsData has the expected structure
      if (
        reportsData &&
        reportsData.success &&
        Array.isArray(reportsData.data)
      ) {
        setReports(reportsData.data);
      } else {
        // If reportsData is already an array, use it directly
        setReports(Array.isArray(reportsData) ? reportsData : []);
      }
      setReportsLoading(false);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReportsError("Failed to load reports");
      setReportsLoading(false);
    }
  };

  // Handle report review submission
  const handleReviewSubmit = async (reportId, reviewData) => {
    try {
      await doctorService.reviewReport(reportId, reviewData);
      // Refresh reports after submission
      fetchReportsData();
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    }
  };

  // Handle chat request approval
  const handleApproveRequest = async (patientId) => {
    try {
      // Use the correct API endpoint with patientId
      await chatService.approveChatRequest(patientId);
      // Refresh chat requests after approval
      fetchDashboardData();
      alert("Chat request approved successfully!");
    } catch (err) {
      console.error("Error approving chat request:", err);
      alert("Failed to approve chat request. Please try again.");
    }
  };

  // Handle chat request rejection
  const handleRejectRequest = async (patientId) => {
    try {
      // Use the correct API endpoint with patientId
      await chatService.rejectChatRequest(patientId);
      // Refresh chat requests after rejection
      fetchDashboardData();
      alert("Chat request rejected.");
    } catch (err) {
      console.error("Error rejecting chat request:", err);
      alert("Failed to reject chat request. Please try again.");
    }
  };

  // Handle approving an appointment
  const handleApproveAppointment = async (appointmentId) => {
    try {
      await appointmentService.approveAppointment(appointmentId);
      alert("Appointment approved successfully!");
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error("Error approving appointment:", error);
      alert(`Failed to approve appointment: ${error.message}`);
    }
  };

  // Handle rejecting an appointment
  const handleRejectAppointment = async (appointmentId) => {
    try {
      await appointmentService.rejectAppointment(appointmentId);
      alert("Appointment rejected successfully!");
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      alert(`Failed to reject appointment: ${error.message}`);
    }
  };

  // Handle completing an appointment
  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await appointmentService.completeAppointment(appointmentId);
      alert("Appointment marked as completed!");
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error("Error completing appointment:", error);
      alert(`Failed to complete appointment: ${error.message}`);
    }
  };

  // Get current location function
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationPosition([latitude, longitude]);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to retrieve your location. Please try again.");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading your dashboard...</p>
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="mt-3 text-gray-600">{error}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaUserMd className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Doctor Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, Dr. {user?.first_name || user?.username}
              </span>
              <button
                onClick={async () => {
                  await authService.logout();
                  navigate("/signin");
                }}
                className="rounded-md bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "dashboard"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "reports"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("reports")}
            >
              Patient Reports
            </button>
            <button
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "appointments"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("appointments")}
            >
              Appointments
            </button>
            <button
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "analytics"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("analytics")}
            >
              Analytics
            </button>
            <button
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "chats"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("chats")}
            >
              Chats
            </button>
            <button
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "profile"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => handleTabChange("profile")}
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {activeTab === "dashboard" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-300 hover:shadow-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-red-100 p-3">
                        <FaClipboardList className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-sm font-medium text-gray-500">
                            Total Reports
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {stats.totalReports}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <button
                        onClick={() => handleTabChange("reports")}
                        className="font-medium text-red-600 hover:text-red-500"
                      >
                        View all reports
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-300 hover:shadow-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-blue-100 p-3">
                        <FaUserCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-sm font-medium text-gray-500">
                            Total Patients
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {stats.totalPatients}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <a
                        href="#"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        View patient list
                      </a>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-300 hover:shadow-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-green-100 p-3">
                        <FaCalendarAlt className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-sm font-medium text-gray-500">
                            Total Appointments
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {stats.totalAppointments}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <button
                        onClick={() => handleTabChange("appointments")}
                        className="font-medium text-green-600 hover:text-green-500"
                      >
                        View all appointments
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow transition-all duration-300 hover:shadow-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-yellow-100 p-3">
                        <MdAnalytics className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="truncate text-sm font-medium text-gray-500">
                            Rating
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {stats.rating}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <a
                        href="#"
                        className="font-medium text-yellow-600 hover:text-yellow-500"
                      >
                        View feedback
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Reports Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Recent Reports
                  </h2>
                  <button
                    onClick={() => handleTabChange("reports")}
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    View all reports
                  </button>
                </div>
                <div className="bg-white overflow-hidden shadow-md rounded-lg">
                  {reportsLoading ? (
                    <div className="text-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"></div>
                      <p className="mt-3 text-gray-600">Loading reports...</p>
                    </div>
                  ) : reportsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600">{reportsError}</p>
                      <button
                        onClick={fetchReportsData}
                        className="mt-2 text-red-600 hover:text-red-700 underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No reports to review.</p>
                    </div>
                  ) : (
                    <ReportsTable
                      reports={reports}
                      onReviewSubmit={handleReviewSubmit}
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "reports" && (
            <div className="bg-white overflow-hidden shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                All Patient Reports
              </h2>
              {reportsLoading ? (
                <div className="text-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"></div>
                  <p className="mt-3 text-gray-600">Loading reports...</p>
                </div>
              ) : reportsError ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{reportsError}</p>
                  <button
                    onClick={fetchReportsData}
                    className="mt-2 text-red-600 hover:text-red-700 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No reports to review.</p>
                </div>
              ) : (
                <ReportsTable
                  reports={reports}
                  onReviewSubmit={handleReviewSubmit}
                />
              )}
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Appointments
              </h2>
              {/* Tab navigation for appointment types */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setAppointmentTab("requests")}
                  className={`py-2 px-4 font-medium text-sm ${
                    appointmentTab === "requests"
                      ? "border-b-2 border-red-600 text-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Chat Requests
                </button>
              </div>

              {/* Real Appointments Tab */}
              {appointmentTab === "appointments" && (
                <div>
                  {appointmentsLoading ? (
                    <div className="text-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"></div>
                      <p className="mt-3 text-gray-600">
                        Loading appointments...
                      </p>
                    </div>
                  ) : appointmentsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600">{appointmentsError}</p>
                      <button
                        // onClick={fetchDashboardData}
                        className="mt-2 text-red-600 hover:text-red-700 underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : !appointments || appointments.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No appointments found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {appointments.map((appointment) => (
                            <tr
                              key={appointment._id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.patientName ||
                                    appointment.patient_name ||
                                    "Patient"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {appointment.appointmentDate
                                  ? new Date(
                                      appointment.appointmentDate
                                    ).toLocaleDateString()
                                  : "N/A"}{" "}
                                at{" "}
                                {appointment.appointmentTime || "Not specified"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    appointment.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : appointment.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : appointment.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : appointment.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {appointment.status.charAt(0).toUpperCase() +
                                    appointment.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {appointment.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleApproveAppointment(
                                          appointment._id
                                        )
                                      }
                                      className="text-green-600 hover:text-green-800 mr-3"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRejectAppointment(appointment._id)
                                      }
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {appointment.status === "approved" && (
                                  <button
                                    onClick={() =>
                                      handleCompleteAppointment(appointment._id)
                                    }
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    Mark Complete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Requests Tab */}
              {appointmentTab === "requests" && (
                <div>
                  {chatRequestsLoading ? (
                    <div className="text-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"></div>
                      <p className="mt-3 text-gray-600">
                        Loading chat requests...
                      </p>
                    </div>
                  ) : chatRequestsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600">{chatRequestsError}</p>
                      <button
                        // onClick={fetchDashboardData}
                        className="mt-2 text-red-600 hover:text-red-700 underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : !chatRequests || chatRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No chat requests found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {chatRequests.map((request) => (
                            <tr key={request._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {request.patientName ||
                                    request.patient_name ||
                                    "Patient"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    request.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : request.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : request.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {request.status.charAt(0).toUpperCase() +
                                    request.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {request.createdAt
                                  ? new Date(request.createdAt).toLocaleString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {request.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleApproveRequest(
                                          request?.patient?._id
                                        )
                                      }
                                      className="text-green-600 hover:text-green-800 mr-3"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRejectRequest(
                                          request?.patient?._id
                                        )
                                      }
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Active Chats Tab */}
              {appointmentTab === "active" && (
                <div>
                  {activeChatsLoading ? (
                    <div className="text-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto"></div>
                      <p className="mt-3 text-gray-600">
                        Loading active chats...
                      </p>
                    </div>
                  ) : activeChatsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600">{activeChatsError}</p>
                      <button
                        // onClick={fetchDashboardData}
                        className="mt-2 text-red-600 hover:text-red-700 underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : !activeChats || activeChats.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No active chats found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Message
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeChats.map((chat) => (
                            <tr key={chat._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {chat.patientName ||
                                    chat.patient_name ||
                                    "Patient"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {chat.lastMessage || "No messages yet"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {chat.createdAt
                                  ? new Date(chat.createdAt).toLocaleString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => navigate(`/chat/${chat._id}`)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Open Chat
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="bg-white overflow-hidden shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Analytics Dashboard
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Patient Demographics
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <FaChartBar className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="mt-2 text-gray-600">Charts coming soon</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Prediction Accuracy
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <FaChartBar className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="mt-2 text-gray-600">Charts coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Advanced analytics features coming soon.
              </p>
            </div>
          )}

          {activeTab === "chats" && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                  <FaComments className="mr-2 text-red-600" />
                  Chat Management
                </h3>

                {/* Chat Requests Section */}
                <div className="mt-6">
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
                        Retry
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
                                  {request.patient?.first_name ||
                                    request.patient?.name ||
                                    "Unknown"}{" "}
                                  {request.patient?.last_name || ""}
                                </h5>
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

                            {request.status === "pending" && (
                              <div className="mt-3 flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleApproveRequest(request.patient._id)
                                  }
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectRequest(request.patient._id)
                                  }
                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Active Chats Section */}
                <div className="mt-8 border-t border-gray-200 pt-6">
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
                        Retry
                      </button>
                    </div>
                  )}

                  {!activeChatsLoading &&
                    !activeChatsError &&
                    activeChats.length === 0 && (
                      <p className="text-sm text-gray-500 py-4">
                        No active chats.
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
                                      {chat.patient?.first_name ||
                                        chat.patient?.name ||
                                        "Unknown"}{" "}
                                      {chat.patient?.last_name || ""}
                                    </h5>
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
                                  {selectedChat.patient?.first_name ||
                                    selectedChat.patient?.name ||
                                    "Unknown"}{" "}
                                  {selectedChat.patient?.last_name || ""}
                                </h5>
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
                                ) : chatMessages?.messages?.length === 0 ? (
                                  <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-gray-500">
                                      No messages yet. Start the conversation!
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {chatMessages?.messages?.map((message) => (
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
                                              ? "bg-blue-100 text-blue-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          <p className="text-sm">
                                            {message.content}
                                          </p>
                                          <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs text-gray-500">
                                              {new Date(
                                                message.timestamp
                                              ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </p>
                                            {message.sender === user?._id && (
                                              <span className="ml-2">
                                                {message.read ? (
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="text-blue-600"
                                                    viewBox="0 0 16 16"
                                                  >
                                                    <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992a.252.252 0 0 1 .02-.022zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486-.943 1.179z" />
                                                  </svg>
                                                ) : (
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="text-gray-400"
                                                    viewBox="0 0 16 16"
                                                  >
                                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514Z" />
                                                    <path d="M5 1.5A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5v1A1.5 1.5 0 0 1 9.5 4h-3A1.5 1.5 0 0 1 5 2.5v-1ZM6.5 1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-3Z" />
                                                  </svg>
                                                )}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Message Input */}
                              <div className="p-4 border-t border-gray-200">
                                <form
                                  onSubmit={handleSendMessage}
                                  className="flex"
                                >
                                  <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) =>
                                      setNewMessage(e.target.value)
                                    }
                                    placeholder="Type a message..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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

          {activeTab === "profile" && (
            <div className="bg-white overflow-hidden shadow-md rounded-lg p-6">
              {/* Profile Header */}
              <div className="flex items-center mb-8">
                <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
                  <FaUserMd className="h-12 w-12 text-red-600" />
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {user?.name || "Doctor"}
                  </h2>
                  <p className="text-gray-600">
                    {user?.specialization || "Specialist"}
                  </p>
                  <p className="text-gray-600">
                    {user?.address?.clinic || "Hospital"}
                  </p>
                </div>
                <div className="ml-auto">
                  {!editingProfile ? (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProfileUpdate}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                        disabled={saveLoading}
                      >
                        {saveLoading ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2" /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Success/Error Messages */}
              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  Profile updated successfully!
                </div>
              )}

              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {saveError}
                </div>
              )}

              {/* Doctor Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Doctor Information
                </h3>

                {editingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.first_name || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            first_name: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.last_name || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            last_name: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={profileData.phone_number || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone_number: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={profileData.specialization || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            specialization: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hospital
                      </label>
                      <input
                        type="text"
                        value={profileData.hospital || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            hospital: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience (years)
                      </label>
                      <input
                        type="number"
                        value={profileData.experience_years || 0}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            experience_years: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        min="0"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="mt-1">{user?.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Experience
                      </p>
                      <p className="mt-1">{user?.experience || "0"} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Qualification
                      </p>
                      <p className="mt-1">
                        {user?.qualification || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Verification Status
                      </p>
                      <p className="mt-1">
                        {user?.isVerified ? (
                          <span className="text-green-600">Verified</span>
                        ) : (
                          <span className="text-yellow-600">
                            Pending Verification
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Available Days
                      </p>
                      <p className="mt-1">
                        {user?.availableDays?.join(", ") || "Not specified"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Qualification
                </h3>
                {editingProfile ? (
                  <textarea
                    value={profileData.bio || ""}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                    placeholder="Enter your qualifications and professional bio here..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {user?.qualification ||
                      "No qualification information provided."}
                  </p>
                )}
              </div>

              {/* Location Map Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-600" />
                    Location
                  </div>
                </h3>
                <p className="text-gray-600 mb-4">
                  {editingProfile
                    ? "Click on the map to set your location. This helps patients find you."
                    : "Your current location is shown on the map below."}
                </p>

                <div className="h-96 border border-gray-300 rounded-lg overflow-hidden">
                  {locationPosition && (
                    <MapContainer
                      center={locationPosition}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker
                        position={locationPosition}
                        setPosition={
                          editingProfile ? setLocationPosition : undefined
                        }
                      />
                    </MapContainer>
                  )}
                </div>

                {editingProfile && (
                  <div className="mt-4 flex flex-col space-y-2">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={loading}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading
                        ? "Getting Location..."
                        : "Use My Current Location"}
                    </button>

                    {locationPosition && (
                      <div className="mt-2 text-sm text-gray-600">
                        Coordinates: {locationPosition[0].toFixed(6)},{" "}
                        {locationPosition[1].toFixed(6)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DoctorDashboard;
