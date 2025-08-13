import { useState, useEffect, useRef } from 'react';
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
  sender: Partial<UserProfile> | string;
  receiver: Partial<UserProfile> | string;
  text: string;
  createdAt: string;
}


export const Message = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
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
  const [error, setError] = useState<{ [key: string]: string | null }>({
    requests: null,
    friends: null,
    messages: null,
    allUsers: null,
  });
  const navigate = useNavigate();


const messagesEndRef = useRef<HTMLDivElement>(null);


const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};


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


useEffect(() => {
  scrollToBottom();
}, [messages]);


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


  const handleApproveRequest = async (senderId?: string) => {
    if (!senderId) {
      alert("Sender ID is missing — cannot approve request.");
      return;
    }
    try {
      await axios.put('http://localhost:3000/api/v1/accept', { fromUser: senderId }, authHeader);
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
      alert('Could not approve request.');
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
    sender: userId || '',
    receiver: selectedFriend._id,
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


  const getSenderId = (message: MessageData): string => {
    if (typeof message.sender === 'string') {
      return message.sender;
    }
    
    if (typeof message.sender === 'object' && message.sender?._id) {
      return message.sender._id;
    }
    
    if (message.sender && typeof message.sender === 'object') {
      const senderObj = message.sender as any;
      return senderObj._id || senderObj.id || senderObj.senderId || '';
    }
    
    const messageObj = message as any;
    if (messageObj.senderId) {
      return messageObj.senderId;
    }
    
    return '';
  };


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
    <div className="min-h-screen bg-black text-white">


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
                  onClick={() => {setActiveTab('feed')
                    navigate("/dashboard")
                  }} 
                  className={`px-4 py-2 rounded-lg transition-all hover:text-white duration-200 text-sm font-medium ${
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
                    activeTab === 'friends' 
                     ? ' text-white' 
                      : ''
                  }`}
                >
                  Messages
                </button>
                <button 
                
                  onClick={() => navigate("/explore")} 
                  className={`px-4 flex items-center hover:text-white py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activeTab === 'chat' 
                     ? ' text-white' 
                      : 'text-neutral-400'
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
className='pt-16 flex'>   
  <motion.aside
  
 initial={{opacity:0, x:-1}}
      animate={{opacity:1, x:0}}
      transition={{duration: 0.6, ease:"easeInOut"}}
  className="fixed w-[280px] h-full bg-slate-900 border-r border-slate-700 p-6 overflow-y-auto hidden lg:block">
  <div className="space-y-6 mt-4">
    <div className="space-y-3">
      <button
        onClick={() => setActiveTab('messages')}
        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center group shadow-lg ${
          activeTab === 'messages'
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/25 transform scale-[1.02]'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md hover:transform hover:scale-[1.01]'
        }`}
      >
        <MessageCircle className={`w-5 h-5 mr-3 transition-transform duration-300 ${
          activeTab === 'messages' ? 'rotate-12' : 'group-hover:rotate-6'
        }`} />
        <span className="font-medium">Chat</span>
      </button>


      <button
        onClick={() => setActiveTab('friends')}
        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center group shadow-lg ${
          activeTab === 'friends'
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/25 transform scale-[1.02]'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md hover:transform hover:scale-[1.01]'
        }`}
      >
        <Users className={`w-5 h-5 mr-3 transition-transform duration-300 ${
          activeTab === 'friends' ? 'rotate-12' : 'group-hover:rotate-6'
        }`} />
        <span className="font-medium">Friends</span>
        <span className={`ml-auto px-2 py-1 text-xs font-bold rounded-full ${
          activeTab === 'friends' 
            ? 'bg-white/20 text-white' 
            : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-white'
        }`}>
          {friends.length}
        </span>
      </button>


      <button
        onClick={() => setActiveTab('requests')}
        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center group shadow-lg relative ${
          activeTab === 'requests'
            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-orange-500/25 transform scale-[1.02]'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md hover:transform hover:scale-[1.01]'
        }`}
      >
        <UserPlus className={`w-5 h-5 mr-3 transition-transform duration-300 ${
          activeTab === 'requests' ? 'rotate-12' : 'group-hover:rotate-6'
        }`} />
        <span className="font-medium">Requests</span>
        {friendRequests.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse border-2 border-slate-900">
            {friendRequests.length}
          </span>
        )}
      </button>
    </div>
  </div>
</motion.aside>
</motion.div>
      <div className='flex-1  ml-[280px]'>
      <div className="max-w-6xl mx-auto pt-10 p-6">
       
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="text-xl font-poppinBold font-bold text-white mb-4">Friend Requests</h2>
            {renderList(loading.requests, error.requests, friendRequests, "No pending friend requests", (request: FriendRequest) => {
              if (!request.sender) return null;
              return (
                <div key={request._id} className="bg-slate-900 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{getDisplayInitial(request.sender)}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{getDisplayName(request.sender)}</h3>
                      <p className="text-slate-400 text-sm">@{request.sender.username}</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApproveRequest(request.sender._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Check className="w-4 h-4" /> <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.sender._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <X className="w-4 h-4" /> <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {(activeTab === 'friends' || activeTab === 'messages') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
            <div className="bg-slate-900 rounded-xl border border-slate-700 flex flex-col">
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold text-white">Friends</h3>
              </div>
              <div className="overflow-y-auto">
                {renderList(loading.friends, error.friends, friends, "Find friends in the Explore tab.", (friend: UserProfile) => (
                    <div key={friend._id} onClick={() => { 
                      setSelectedFriend(friend); 
                      setActiveTab('messages'); 
                    }} className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors ${selectedFriend?._id === friend._id ? 'bg-blue-800' : ''}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">{getDisplayInitial(friend)}</span>
                          </div>
                          <div>
                              <p className="text-white font-medium">{getDisplayName(friend)}</p>
                              <p className="text-slate-400 text-sm">@{friend.username}</p>
                          </div>
                        </div>
                    </div>
                ))}
              </div>
            </div>


            <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 flex flex-col">
              {selectedFriend && activeTab === 'messages' ? (
                <>
                  <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedFriend(null);
                          setActiveTab('friends');
                        }}
                        className="text-slate-400 hover:text-white mr-2 lg:hidden"
                      >
                        ←
                      </button>
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{getDisplayInitial(selectedFriend)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{getDisplayName(selectedFriend)}</p>
                        <p className="text-slate-400 text-sm">@{selectedFriend.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="text-slate-400 hover:text-white"><Phone className="w-5 h-5" /></button>
                      <button className="text-slate-400 hover:text-white"><Video className="w-5 h-5" /></button>
                      <button className="text-slate-400 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-280px)] min-h-0">
  {loading.messages ? (
    <div className="flex justify-center items-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
    </div>
  ) : (
    <>
      {messages.map((message) => {
        const senderId = getSenderId(message);
        const isOwnMessage = senderId === userId;
        
        return (
          <div key={message._id} className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words ${
              isOwnMessage 
                ? 'bg-blue-600 text-white ml-auto' 
                : 'bg-slate-800 text-white mr-auto'
            }`}>
              <p className="whitespace-pre-wrap">{message.text}</p>
              <p className="text-xs mt-1 opacity-70 text-right">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </>
  )}
</div>
                  <div className="p-4 border-t border-slate-700">
                    <div className="flex space-x-2">
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 bg-slate-800 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {activeTab === 'friends' 
                        ? "Select a friend to start a conversation" 
                        : "Select a friend from the list to start chatting"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
