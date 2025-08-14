import { useState, useEffect, useRef } from 'react';
import {
  Search, MessageCircle, Users, UserPlus, Check, X,
  Send, Phone, Video, MoreHorizontal, Loader2,
  Code,
  User,
  Bell,
  SearchIcon,
  ArrowLeft,
  Menu
} from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";

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
  const [activeTab, setActiveTab] = useState('messages');
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
  const [lastMessage, setLastMessage] = useState<MessageData | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      const response = await axios.get('https://devhub-h0gg.onrender.com/api/v1/requests', authHeader);
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

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket("wss://devhub-h0gg.onrender.com");

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "connect",
        userId: userId
      }));
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const receivedMessage: MessageData = JSON.parse(event.data);
      setLastMessage(receivedMessage);
    };

    ws.onerror = () => {};
    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [userId]);

  const getSenderId = (message: MessageData): string => {
    if (typeof message.sender === 'string') {
      return message.sender;
    }
    if (typeof message.sender === 'object' && message.sender?._id) {
      return message.sender._id;
    }
    return '';
  };

  useEffect(() => {
    if (lastMessage && selectedFriend && getSenderId(lastMessage) === selectedFriend._id) {
      setMessages((prev) => [...prev, lastMessage]);
    } else if (lastMessage) {
        // notification for new messages in other chats can be implemented here.
    }
  }, [lastMessage, selectedFriend]);

  const fetchFriends = async () => {
    if (!token) return;
    setLoading(prev => ({ ...prev, friends: true }));
    setError(prev => ({ ...prev, friends: null }));
    try {
      const response = await axios.get('https://devhub-h0gg.onrender.com/api/v1/friends', authHeader);
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
      const response = await axios.get('https://devhub-h0gg.onrender.com/api/v1/getUser', authHeader);
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

  const handleMarkAsSeen = async (friendId: string) => {
    if (!token) return;
    try {
      await axios.put(`https://devhub-h0gg.onrender.com/api/v1/seenMessage`, { senderId: friendId }, authHeader);
    } catch (error) {
       // Handle error silently
    }
  };

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend._id);
      handleMarkAsSeen(selectedFriend._id);
    } else {
      setMessages([]);
    }
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAddFriend = async (receiverId: string) => {
    try {
      await axios.post('https://devhub-h0gg.onrender.com/api/v1/request', { toUser: receiverId }, authHeader);
      setSentRequestIds(prev => [...prev, receiverId]);
    } catch (error) {
       // Handle error silently
    }
  };

  const handleApproveRequest = async (senderId?: string) => {
    if (!senderId) return;
    try {
      await axios.put('https://devhub-h0gg.onrender.com/api/v1/accept', { fromUser: senderId }, authHeader);
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
       // Handle error silently
    }
  };

  const handleRejectRequest = async (senderId?: string) => {
    if (!senderId) return;
    try {
      await axios.put('https://devhub-h0gg.onrender.com/api/v1/decline', { fromUser: senderId }, authHeader);
      fetchFriendRequests();
    } catch (error) {
       // Handle error silently
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !socket) return;

    const messageContent = newMessage.trim();
    const messagePayload: MessageData = {
      _id: `temp_${Date.now()}`,
      sender: userId || '',
      receiver: selectedFriend._id,
      text: messageContent,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, messagePayload]);
    setNewMessage('');

    try {
      socket.send(JSON.stringify({
        type: "chat",
        payload: {
          receiverId: selectedFriend._id,
          message: messagePayload
        }
      }));

      await axios.post(
        'https://devhub-h0gg.onrender.com/api/v1/sendMessage',
        { receiverId: selectedFriend._id, text: messageContent },
        authHeader
      );

    } catch (error) {
      setMessages(prev => prev.filter(msg => msg._id !== messagePayload._id));
    }
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
                  onClick={() => navigate("/dashboard/message")
                  } 
                  className={`px-3 lg:px-4 py-2 rounded-lg hover:text-white transition-all duration-200 text-xs lg:text-sm font-medium ${
                    activeTab === 'chat' 
                      ? ' text-white' 
                      : ''
                  }`}
                >
                  Messages
                </button>
                <button 
                  onClick={() => {navigate("/explore")
                    
                  }} 
                  className={`px-3 lg:px-4 flex items-center hover:text-white py-2 rounded-lg transition-all duration-200 text-xs lg:text-sm font-medium ${
                    activeTab === 'friends' 
                      ? ' text-white' 
                      : 'text-neutral-400'
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
          transition={{duration: 0.3, ease: "easeInOut"}} className="md:hidden bg-slate-800 border-t border-slate-700">
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

      <div className="flex pt-14 pb-2 h-screen">
        <motion.aside
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed w-[280px] h-full bg-slate-900 border-r border-slate-700 p-6 overflow-y-auto hidden lg:block">
          <div className="space-y-6 mt-4">
            <div className="space-y-3">
              <button onClick={() => setActiveTab('messages')} className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center group shadow-lg ${activeTab === 'messages' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/25 transform scale-[1.02]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md hover:transform hover:scale-[1.01]'}`}>
                <MessageCircle className={`w-5 h-5 mr-3 transition-transform duration-300 ${activeTab === 'messages' ? 'rotate-12' : 'group-hover:rotate-6'}`} />
                <span className="font-medium">Chat</span>
              </button>
              <button onClick={() => setActiveTab('friends')} className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center group shadow-lg ${activeTab === 'friends' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/25 transform scale-[1.02]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md hover:transform hover:scale-[1.01]'}`}>
                <Users className={`w-5 h-5 mr-3 transition-transform duration-300 ${activeTab === 'friends' ? 'rotate-12' : 'group-hover:rotate-6'}`} />
                <span className="font-medium">Friends</span>
                <span className={`ml-auto px-2 py-1 text-xs font-bold rounded-full ${activeTab === 'friends' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-white'}`}>{friends.length}</span>
              </button>
              <button onClick={() => setActiveTab('requests')} className={`w-full px-4 py-3 rounded-xl transition-all duration-300 flex items-center group shadow-lg relative ${activeTab === 'requests' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-orange-500/25 transform scale-[1.02]' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md hover:transform hover:scale-[1.01]'}`}>
                <UserPlus className={`w-5 h-5 mr-3 transition-transform duration-300 ${activeTab === 'requests' ? 'rotate-12' : 'group-hover:rotate-6'}`} />
                <span className="font-medium">Requests</span>
                {friendRequests.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse border-2 border-slate-900">{friendRequests.length}</span>
                )}
              </button>
            </div>
          </div>
        </motion.aside>

        <main className='flex-1 lg:ml-[280px] w-full lg:w-auto h-full overflow-y-auto pb-16 lg:pb-0'>
          <div className="max-w-6xl mx-auto p-4 md:p-6 h-full">
            {activeTab === 'requests' && (
              <div className="space-y-4">
                <h2 className="text-xl font-poppinBold font-bold text-white mb-4">Friend Requests</h2>
                {renderList(loading.requests, error.requests, friendRequests, "No pending friend requests", (request: FriendRequest) => {
                  if (!request.sender) return null;
                  return (
                    <div key={request._id} className="bg-slate-900 p-4 md:p-6 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">{getDisplayInitial(request.sender)}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{getDisplayName(request.sender)}</h3>
                          <p className="text-slate-400 text-sm">@{request.sender.username}</p>
                        </div>
                      </div>
                      <div className="flex space-x-3 flex-shrink-0">
                        <button onClick={() => handleApproveRequest(request.sender._id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"><Check className="w-4 h-4" /> <span>Accept</span></button>
                        <button onClick={() => handleRejectRequest(request.sender._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"><X className="w-4 h-4" /> <span>Reject</span></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {(activeTab === 'friends' || activeTab === 'messages') && (
              <div className="flex lg:grid lg:grid-cols-3 gap-6 h-full">
                <div className={`${(selectedFriend && activeTab === 'messages') ? 'hidden' : 'flex'} lg:flex flex-col bg-slate-900 rounded-xl border border-slate-700 w-full`}>
                  <div className="p-4 border-b border-slate-700"><h3 className="font-semibold text-white">Friends</h3></div>
                  <div className="overflow-y-auto flex-1">
                    {renderList(loading.friends, error.friends, friends, "Find new friends to chat with.", (friend: UserProfile) => (
                      <div key={friend._id} onClick={() => { setSelectedFriend(friend); setActiveTab('messages'); }} className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors ${selectedFriend?._id === friend._id ? 'bg-blue-900/50' : ''}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
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

                <div className={`${(selectedFriend && activeTab === 'messages') ? 'flex' : 'hidden'} lg:flex flex-col lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 w-full`}>
                  {selectedFriend && activeTab === 'messages' ? (
                    <>
                      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => setSelectedFriend(null)} className="lg:hidden mr-2 p-1 rounded-full hover:bg-slate-700">
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">{getDisplayInitial(selectedFriend)}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{getDisplayName(selectedFriend)}</p>
                            <p className="text-slate-400 text-sm">@{selectedFriend.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <button className="text-slate-400 hover:text-white p-1"><Phone className="w-5 h-5" /></button>
                          <button className="text-slate-400 hover:text-white p-1"><Video className="w-5 h-5" /></button>
                          <button className="text-slate-400 hover:text-white p-1"><MoreHorizontal className="w-5 h-5" /></button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                        {loading.messages ? (
                          <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
                        ) : (
                          <>
                            {messages.map((message) => {
                              const isOwnMessage = getSenderId(message) === userId;
                              return (
                                <div key={message._id} className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl break-words ${isOwnMessage ? 'bg-blue-600 text-white ml-auto rounded-br-none' : 'bg-slate-800 text-white mr-auto rounded-bl-none'}`}>
                                    <p className="whitespace-pre-wrap">{message.text}</p>
                                    <p className="text-xs mt-1 opacity-70 text-right">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                          <button onClick={handleSendMessage} disabled={!newMessage.trim() || !socket} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="hidden lg:flex flex-1 items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Select a friend to start a conversation</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 flex justify-around lg:hidden z-50">
        <button onClick={() => { setActiveTab('messages'); setSelectedFriend(null); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-24 ${activeTab === 'messages' || (activeTab === 'friends' && selectedFriend == null) ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}>
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-medium">Chats</span>
        </button>
        <button onClick={() => { setActiveTab('requests'); setSelectedFriend(null); }} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-24 relative ${activeTab === 'requests' ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}>
          <UserPlus className="w-6 h-6" />
          <span className="text-xs font-medium">Requests</span>
          {friendRequests.length > 0 && (
            <span className="absolute top-0 right-4 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">{friendRequests.length}</span>
          )}
        </button>
      </div>
    </div>
  );
};