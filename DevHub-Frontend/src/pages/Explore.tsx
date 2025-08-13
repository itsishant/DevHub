import { useState, useEffect } from 'react';
import {
  Search, MessageCircle, Users, UserPlus, Check, X,
  Send, Phone, Video, MoreHorizontal, Loader2,
  Code,
  User,
  Bell,
  SearchIcon
} from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Route, useNavigate } from 'react-router-dom';
import { motion } from "motion/react"

// It's good practice to define types for your data structures
interface UserProfile {
  _id: string;
  username: string;
  avatar?: string;
  Bio?: {
    firstname?: string;
    lastname?: string;
  }[];
}

interface FriendRequest {
  _id: string;
  sender: UserProfile; // The 'fromUser' from backend will be mapped to this
  receiver: string;
  status: string;
}

// Added type for message objects for better type safety
// At the top of your file
interface MessageData {
  _id: string;
  sender: Partial<UserProfile>; // Now an object, can be partial
  receiver: Partial<UserProfile>; // Now an object, can be partial
  text: string;
  createdAt: string;
}

export const Explore = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]); // Typed state
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    requests: true,
    friends: true,
    messages: false,
    allUsers: true,
  });
  const [error, setError] = useState<{ [key: string]: string | null }>({ // Typed state
    requests: null,
    friends: null,
    messages: null,
    allUsers: null,
  });

  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userId = token ? (jwtDecode(token) as { id: string }).id : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  
  const fetchFriendRequests = async () => {
    if (!token) return;
    setLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: null }));
    try {
      const response = await axios.get('http://localhost:3000/api/v1/requests', authHeader);
      const formattedRequests = response.data.requests.map((req: any) => ({
        ...req,
        sender: req.fromUser 
      }));
      setFriendRequests(formattedRequests || []);
    } catch (err) {
      setError(prev => ({ ...prev, requests: 'Failed to load requests.' }));
      console.error('Error fetching friend requests:', err);
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  }
  
  const fetchFriends = async () => {
    if (!token) return;
    setLoading(prev => ({ ...prev, friends: true }));
    setError(prev => ({ ...prev, friends: null }));
    try {
      const response = await axios.get('http://localhost:3000/api/v1/friends', authHeader);
      // Backend returns friend documents. We must process them to get a simple list of friends.
      const friendProfiles = response.data.friends.map((friendship: any) => {
          // Identify who the friend is in the relationship object
          return friendship.fromUser._id === userId ? friendship.toUser : friendship.fromUser;
      }).filter(Boolean); // Filter out any potential null/undefined values
      setFriends(friendProfiles || []);
    } catch (err) {
      setError(prev => ({ ...prev, friends: 'Failed to load friends.' }));
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(prev => ({ ...prev, friends: false }));
    }
  };

  const fetchAllUsers = async () => {
    if (!token) return;
    setLoading(prev => ({ ...prev, allUsers: true }));
    setError(prev => ({ ...prev, allUsers: null }));
    try {
      const response = await axios.get('http://localhost:3000/api/v1/getUser', authHeader);
      // Backend key is 'User' with a capital 'U'
      setAllUsers(response.data.User || []);
    } catch (err) {
      setError(prev => ({ ...prev, allUsers: 'Failed to load users.' }));
      console.error('Error fetching all users:', err);
    } finally {
      setLoading(prev => ({ ...prev, allUsers: false }));
    }
  };

  // NOTE: Your backend is missing a route to GET messages for a specific chat.
  // You'll need to add a route like `GET /api/v1/messages/:friendId` for this to work.
const fetchMessages = async (friendId: string) => {
  if (!friendId) return;
  setLoading(prev => ({ ...prev, messages: true }));
  setError(prev => ({ ...prev, messages: null }));
  try {
    const response = await axios.get(`http://localhost:3000/api/v1/messages/${friendId}`, authHeader);
    setMessages(response.data.messages || []);
  } catch (err) {
    setError(prev => ({ ...prev, messages: 'Failed to load messages.' }));
    console.error('Error fetching messages:', err);
  } finally {
    setLoading(prev => ({ ...prev, messages: false }));
  }
};
  useEffect(() => {
    if (token) {
      fetchFriendRequests();
      fetchFriends();
      fetchAllUsers();
    }
  }, [token]);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend._id);
    } else {
        setMessages([]); // Clear messages when no friend is selected
    }
  }, [selectedFriend]);

  const handleAddFriend = async (receiverId: string) => {
    try {
      await axios.post('http://localhost:3000/api/v1/request', { toUser: receiverId }, authHeader);
      setSentRequestIds(prev => [...prev, receiverId]);
    } catch (error) {
      console.error('Error sending friend request:', error);
      if (axios.isAxiosError(error) && (error as AxiosError).response?.status === 411) {
        alert('Friend request already sent or you are already friends.');
      } else {
        alert('Could not send friend request.');
      }
    }
  };

  

  const handleRejectRequest = async (senderId?: string) => {
    if (!senderId) {
        console.error("Missing senderId for rejection");
        alert("Cannot reject request: sender information is missing.");
        return;
    }
    try {
      await axios.put('http://localhost:3000/api/v1/decline', { fromUser: senderId }, authHeader);
      fetchFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Could not reject request.');
    }
  }
  
const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedFriend) return;

  const messageContent = newMessage.trim();

  // The correction is right here: change `content` to `text`
  const optimisticMessage: MessageData = { // Added type for safety
    _id: Date.now().toString(),
    sender: { _id: userId || '' }, // Corrected to match updated MessageData type (see below)
    receiver: { _id: selectedFriend._id }, // Corrected as well
    text: messageContent, // <-- CORRECTED
    createdAt: new Date().toISOString(),
  };

  // Optimistically add message to UI
  setMessages(prev => [...prev, optimisticMessage]);
  setNewMessage('');

  try {
    const response = await axios.post(
      'http://localhost:3000/api/v1/sendMessage',
      {
        receiverId: selectedFriend._id,
        text: messageContent,
      },
      authHeader
    );
    if (response.data.message && response.data.message._id) {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === optimisticMessage._id ? response.data.message : msg
        )
      );
    }
  } catch (error) {
    console.error('❌ Error sending message:', error);
    // Remove optimistic message on failure
    setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
    // ... your excellent error alert logic
    if (axios.isAxiosError(error)) {
        // ... (no changes needed here)
    } else {
        alert('Failed to send message.');
    }
  }
};

  const friendIds = new Set(friends.map(f => f?._id).filter(Boolean));
  const pendingRequestSenderIds = new Set(
    friendRequests
      .map(r => r?.sender?._id)
      .filter(Boolean)
  );


  const handleMarkAsSeen = async (friendId: string) => {
    if (!token) return;
    try {
      // Your backend expects the person who sent the messages (the 'friendId')
      await axios.put('http://localhost:3000/api/v1/seenMessage', { senderId: friendId }, authHeader);
      console.log(`Messages from ${friendId} marked as seen.`);
    } catch (error) {
      console.error("Failed to mark messages as seen", error);
    }
}
useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend._id);
      
      handleMarkAsSeen(selectedFriend._id); 
    } else {
        setMessages([]); // Clear messages when no friend is selected
    }
  }, [selectedFriend]); // This hook correctly depends on selectedFriend

  const filteredExploreUsers = allUsers.filter(user =>
    user._id !== userId &&
    !friendIds.has(user._id) &&
    !pendingRequestSenderIds.has(user._id) &&
    !sentRequestIds.includes(user._id) && 
    (user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.Bio?.[0]?.firstname?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderList = (loadingState: boolean, errorState: string | null, data: any[], emptyMessage: string, renderItem: (item: any, index: number) => React.ReactNode) => {
    if (loadingState) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
    if (errorState) return <div className="text-center py-10 text-red-400">{errorState}</div>;
    if (data.length === 0) return <div className="text-center py-10 text-slate-400">{emptyMessage}</div>;
    return <div className="grid gap-4">{data.map(renderItem)}</div>;
  };

  const getDisplayName = (user: UserProfile) => {
    const bio = user.Bio?.[0];
    if (bio?.firstname) {
        return `${bio.firstname}`.trim();
    }
    return user.username;
  }

  const getDisplayInitial = (user: UserProfile) => {
    return user.Bio?.[0]?.firstname?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
        <nav className="fixed top-0 w-full bg-slate-900 border-b border-slate-700 z-50 shadow-lg">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
  <h1 className="text-xl font-bold text-white">Dev
                  <span className='text-purple-600'> Hub</span>
                </h1>              </div>
              <div className="hidden md:flex space-x-2">
                <button 
                  onClick={() => navigate("/dashboard")} 
                  className={`px-4 py-2 rounded-lg hover:text-white transition-all duration-200 text-sm font-medium ${
                    activeTab === 'feed' 
                      ? ' text-white' 
                      : 'text-neutral-400'
                  }`}
                >
                  Feed
                </button>
                <button 
                  onClick={() => navigate("/dashboard/message")} 
                  className={`px-4 py-2 rounded-lg hover:text-white transition-all duration-200 text-sm font-medium ${
                    activeTab === 'chat' 
                      ? ' text-white' 
                      : 'text-neutral-400'
                  }`}
                >
                  Messages
                </button>
                <button 
                
                  onClick={() => {navigate("/explore")
                    setActiveTab("explore")
                  }} 
                  className={`px-4 flex items-center hover:text-white py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activeTab === 'friends' 
                      ? ' text-white' 
                      : ''
                  }`}
                >
                 <SearchIcon className='size-6 pr-2'/> Explore
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex relative">
              </div>
              <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
               <button onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 text-white" />
                </button>
              </div>
              <button
                className="flex items-center bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                onClick={() => {
                  setTimeout(() => {
                    localStorage.removeItem("token");
                    navigate("/")
                  }, 1000)
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <motion.div 
      className="max-w-6xl mx-auto mt-16 p-6">
        {activeTab === 'explore' && (
          <motion.div 
          className="space-y-4">
            <motion.div 
            
            initial={{opacity:0, x:0}}
            animate={{opacity:1, x:1}}
            transition={{duration: 0.4, ease:"easeInOut"}}> 
            <h2 className="text-2xl font-sans font-bold text-neutral-300 mt-2  mb-8">Explore Users</h2> </motion.div>
            <div className="relative mb-4 ">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Search users by name or username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {renderList(loading.allUsers, error.allUsers, filteredExploreUsers, "No new users found.", (user: UserProfile) => (
              <motion.div
              
      initial={{opacity:0, y:10}}
      animate={{opacity:1, y:0}}
      transition={{duration:0.8, ease:"easeInOut"}}
              key={user._id} className="bg-slate-900 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-800 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{getDisplayInitial(user)}</span>
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">{getDisplayName(user)}</h3>
                    <p className="text-slate-400 text-sm">@{user.username}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  {sentRequestIds.includes(user._id) ? (
                    <button disabled className="bg-slate-600 text-slate-300 px-4 py-2 rounded-lg flex items-center space-x-2 cursor-not-allowed">
                      <Check className="w-4 h-4" /> <span>Request Sent</span>
                    </button>
                  ) : (
                    <button onClick={() => handleAddFriend(user._id)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                      <UserPlus className="w-4 h-4" /> <span>Add Friend</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};