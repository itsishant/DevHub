import { useState, useEffect } from 'react';
import {
  Search, MessageCircle, Users, UserPlus, Check, X,
  Send, Phone, Video, MoreHorizontal, Loader2,
  Code,
  User,
  Bell,
  SearchIcon,
  Menu
} from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Route, useNavigate } from 'react-router-dom';
import { motion } from "motion/react"

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
  sender: UserProfile;
  receiver: string;
  status: string;
}

interface MessageData {
  _id: string;
  sender: Partial<UserProfile>;
  receiver: Partial<UserProfile>;
  text: string;
  createdAt: string;
}

export const Explore = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState({
    requests: true,
    friends: true,
    messages: false,
    allUsers: true,
  });
  const [error, setError] = useState<{ [key: string]: string | null }>({
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
      const friendProfiles = response.data.friends.map((friendship: any) => {
          return friendship.fromUser._id === userId ? friendship.toUser : friendship.fromUser;
      }).filter(Boolean);
      setFriends(friendProfiles || []);
    } catch (err) {
      setError(prev => ({ ...prev, friends: 'Failed to load friends.' }));
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
      setAllUsers(response.data.User || []);
    } catch (err) {
      setError(prev => ({ ...prev, allUsers: 'Failed to load users.' }));
    } finally {
      setLoading(prev => ({ ...prev, allUsers: false }));
    }
  };

const fetchMessages = async (friendId: string) => {
  if (!friendId) return;
  setLoading(prev => ({ ...prev, messages: true }));
  setError(prev => ({ ...prev, messages: null }));
  try {
    const response = await axios.get(`http://localhost:3000/api/v1/messages/${friendId}`, authHeader);
    setMessages(response.data.messages || []);
  } catch (err) {
    setError(prev => ({ ...prev, messages: 'Failed to load messages.' }));
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
        setMessages([]);
    }
  }, [selectedFriend]);

  const handleAddFriend = async (receiverId: string) => {
    try {
      await axios.post('http://localhost:3000/api/v1/request', { toUser: receiverId }, authHeader);
      setSentRequestIds(prev => [...prev, receiverId]);
    } catch (error) {
      if (axios.isAxiosError(error) && (error as AxiosError).response?.status === 411) {
        alert('Friend request already sent or you are already friends.');
      } else {
        alert('Could not send friend request.');
      }
    }
  };

  const handleRejectRequest = async (senderId?: string) => {
    if (!senderId) {
        alert("Cannot reject request: sender information is missing.");
        return;
    }
    try {
      await axios.put('http://localhost:3000/api/v1/decline', { fromUser: senderId }, authHeader);
      fetchFriendRequests();
    } catch (error) {
      alert('Could not reject request.');
    }
  }
  
const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedFriend) return;

  const messageContent = newMessage.trim();

  const optimisticMessage: MessageData = {
    _id: Date.now().toString(),
    sender: { _id: userId || '' },
    receiver: { _id: selectedFriend._id },
    text: messageContent,
    createdAt: new Date().toISOString(),
  };

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
    setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
    if (axios.isAxiosError(error)) {
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
      await axios.put('http://localhost:3000/api/v1/seenMessage', { senderId: friendId }, authHeader);
    } catch (error) {
    }
}
useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend._id);
      
      handleMarkAsSeen(selectedFriend._id); 
    } else {
        setMessages([]);
    }
  }, [selectedFriend]);

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
          <div className="flex justify-between items-center h-12 lg:h-16">
            <div className="flex items-center space-x-2 lg:space-x-8">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-purple-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Code className="w-3 h-3 lg:w-5 lg:h-5 text-white" />
                </div>
  <h1 className="text-lg lg:text-xl font-bold text-white">Dev
                  <span className='text-purple-600'>Hub</span>
                </h1>              </div>
              <div className="hidden md:flex space-x-2">
                <button 
                  onClick={() => navigate("/dashboard")} 
                  className={`px-3 lg:px-4 py-2 rounded-lg hover:text-white transition-all duration-200 text-xs lg:text-sm font-medium ${
                    activeTab === 'feed' 
                      ? ' text-white' 
                      : 'text-neutral-400'
                  }`}
                >
                  Feed
                </button>
                <button 
                  onClick={() => navigate("/dashboard/message")} 
                  className={`px-3 lg:px-4 py-2 rounded-lg hover:text-white transition-all duration-200 text-xs lg:text-sm font-medium ${
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
                  className={`px-3 lg:px-4 flex items-center hover:text-white py-2 rounded-lg transition-all duration-200 text-xs lg:text-sm font-medium ${
                    activeTab === 'friends' 
                      ? ' text-white' 
                      : ''
                  }`}
                >
                 <SearchIcon className='size-4 lg:size-6 pr-1 lg:pr-2'/> Explore
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-6">
              <div className="flex relative">
              </div>
              <button className="relative p-1 lg:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
              </button>
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
               <button onClick={() => navigate("/profile")}>
                <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </button>
              </div>
              <button
                className="hidden md:flex items-center bg-red-600 text-white py-1 lg:py-2 px-3 lg:px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 text-xs lg:text-sm"
                onClick={() => {
                  setTimeout(() => {
                    localStorage.removeItem("token");
                    navigate("/")
                  }, 1000)
                }}
              >
                Logout
              </button>
              <button 
                className="md:hidden p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <motion.div 
          initial={{opacity:0, y:-1}}
          animate={{opacity:1, y:0}}
          transition={{duration: 0.3, ease: "easeInOut"}}
          className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-3 space-y-2">
              <button 
                onClick={() => {navigate("/dashboard"); setIsMobileMenuOpen(false);}} 
                className="block w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm"
              >
                Feed
              </button>
              <button 
                onClick={() => {navigate("/dashboard/message"); setIsMobileMenuOpen(false);}} 
                className="block w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm"
              >
                Messages
              </button>
              <button 
                onClick={() => {navigate("/explore"); setActiveTab("explore"); setIsMobileMenuOpen(false);}} 
                className="block w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm"
              >
                Explore
              </button>
              <button
                className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors text-sm"
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
          </motion.div>
        )}
      </nav>

      <motion.div 
      className="max-w-6xl mx-auto mt-12 lg:mt-16 p-4 lg:p-6">
        {activeTab === 'explore' && (
          <motion.div 
          className="space-y-4">
            <motion.div 
            initial={{opacity:0, x:0}}
            animate={{opacity:1, x:1}}
            transition={{duration: 0.4, ease:"easeInOut"}}> 
            <h2 className="text-xl lg:text-2xl font-sans font-bold text-neutral-300 mt-2 mb-6 lg:mb-8">Explore Users</h2> </motion.div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search users by name or username..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm lg:text-base pl-10 pr-4 py-2 lg:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            {renderList(loading.allUsers, error.allUsers, filteredExploreUsers, "No new users found.", (user: UserProfile) => (
              <motion.div
      initial={{opacity:0, y:10}}
      animate={{opacity:1, y:0}}
      transition={{duration:0.8, ease:"easeInOut"}}
              key={user._id} className="bg-slate-900 p-4 lg:p-6 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3 lg:space-x-4 w-full sm:w-auto">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-600 to-blue-800 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-base lg:text-lg">{getDisplayInitial(user)}</span>
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <h3 className="text-white text-base lg:text-lg font-semibold">{getDisplayName(user)}</h3>
                    <p className="text-slate-400 text-xs lg:text-sm">@{user.username}</p>
                  </div>
                </div>
              
                <div className="flex space-x-3 sm:w-auto">
                  {sentRequestIds.includes(user._id) ? (
                    <button disabled className="bg-slate-600 text-slate-300 px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-2 cursor-not-allowed text-sm lg:text-base w-full sm:w-auto justify-center">
                      <Check className="w-3 h-3 lg:w-4 lg:h-4" /> <span>Request Sent</span>
                    </button>
                  ) : (
                    <button onClick={() => handleAddFriend(user._id)} className="bg-blue-700 hover:bg-blue-800 text-white px-3 lg:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm lg:text-base w-full sm:w-auto justify-center">
                      <UserPlus className="w-3 h-3 lg:w-4 lg:h-4" /> <span>Add Friend</span>
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