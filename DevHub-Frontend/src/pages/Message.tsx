import { useState, useEffect } from 'react';
import {
  Search, MessageCircle, Users, UserPlus, Check, X,
  Send, Phone, Video, MoreHorizontal, Loader2
} from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

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
interface MessageData {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
}

export const Message = () => {
  const [activeTab, setActiveTab] = useState('messages');
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

  const token = localStorage.getItem('token');
  const userId = token ? (jwtDecode(token) as { id: string }).id : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  
  const fetchFriendRequests = async () => {
    if (!token) return;
    setLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: null }));
    try {
      const response = await axios.get('http://localhost:3000/api/v1/requests', authHeader);
      // The backend sends 'requests' with a 'fromUser' object. We map it to 'sender'.
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

  const handleApproveRequest = async (senderId?: string) => {
    if (!senderId) {
      console.error("Missing senderId");
      alert("Sender ID is missing — cannot approve request.");
      return;
    }
    try {
      await axios.put('http://localhost:3000/api/v1/accept', { fromUser: senderId }, authHeader);
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
      console.error('Error approving friend request:', error);
      alert('Could not approve request.');
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
  const optimisticMessage = {
    _id: Date.now().toString(),
    sender: userId || '', // fallback empty string if undefined
    receiver: selectedFriend._id,
    content: messageContent,
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
        text: messageContent,  // backend expects 'text'
      },
      authHeader
    );

    console.log('✅ Message sent:', response.data);

    // If backend returns the created message object, replace optimistic message
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

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorMsg = error.response?.data?.message;

      if (status === 400) {
        alert(`Validation error: ${errorMsg}`);
      } else if (status === 403 || status === 411) {
        alert('Unable to send message. Make sure you are friends.');
      } else {
        alert(`Failed to send message: ${errorMsg || 'Unknown error'}`);
      }
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
    <div className="min-h-screen bg-black text-white">
      <div className="bg-slate-900 border-b border-slate-700 p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-poppinBold font-bold text-white">Messages & Network</h1>
          <div className="flex flex-wrap space-x-2">
            <button onClick={() => setActiveTab('explore')} className={`px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'explore' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <Search className="w-4 h-4 inline mr-2" /> Explore
            </button>
            <button onClick={() => setActiveTab('messages')} className={`px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'messages' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <MessageCircle className="w-4 h-4 inline mr-2" /> Messages
            </button>
            <button onClick={() => setActiveTab('friends')} className={`px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'friends' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <Users className="w-4 h-4 inline mr-2" /> Friends ({friends.length})
            </button>
            <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded-lg transition-all duration-200 relative ${activeTab === 'requests' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              <UserPlus className="w-4 h-4 inline mr-2" /> Requests
              {friendRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {friendRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'explore' && (
          <div className="space-y-4">
            <h2 className="text-xl font-poppinBold font-bold text-white mb-4">Explore Users</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Search users by name or username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {renderList(loading.allUsers, error.allUsers, filteredExploreUsers, "No new users found.", (user: UserProfile) => (
              <div key={user._id} className="bg-slate-900 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
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
                    <button onClick={() => handleAddFriend(user._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                      <UserPlus className="w-4 h-4" /> <span>Add Friend</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="text-xl font-poppinBold font-bold text-white mb-4">Friend Requests</h2>
            {renderList(loading.requests, error.requests, friendRequests, "No pending friend requests", (request: FriendRequest) => {
              if (!request.sender) return null; // Defensive check
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
                    <div key={friend._id} onClick={() => { setSelectedFriend(friend); setActiveTab('messages'); }} className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors ${selectedFriend?._id === friend._id ? 'bg-blue-800' : ''}`}>
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
              {selectedFriend ? (
                <>
                  <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
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
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading.messages && <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>}
                    {error.messages && <div className="text-center py-10 text-red-400">{error.messages}</div>}
                    {!loading.messages && messages.map((message) => {
                      const isOwnMessage = message.sender === userId;
                      return (
                        <div key={message._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage ? 'bg-blue-600' : 'bg-slate-800'}`}>
                            <p>{message.content}</p>
                            <p className="text-xs mt-1 opacity-70 text-right">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      );
                    })}
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
                    <p className="text-slate-400">Select a friend to start a conversation.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
