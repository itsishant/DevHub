import { useState, useEffect } from 'react';
import {
  Search, Bell, MessageCircle, Heart, Share2, Settings, Send,
  Users, Code, Zap, Sparkles, User, Loader2
} from 'lucide-react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [userStats, setUserStats] = useState({ posts: 0, friends: 0 });
  const [messages, setMessages] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loading, setLoading] = useState({
    posts: true,
    friends: true,
    stats: true,
    trending: true,
    messages: false
  });
  const [error, setError] = useState({
    posts: null,
    friends: null,
    stats: null,
    trending: null,
    messages: null
  });
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).id : null;

  // --- FETCH POSTS on mount ---

  const fetchPosts = async () => {
  setLoading(prev => ({ ...prev, posts: true }));
  try {
    const response = await axios.get("http://localhost:3000/api/v1/content");
    console.log(response);
    const sortedPosts = (response.data.posts || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setPosts(sortedPosts);
    setLoading(prev => ({ ...prev, posts: false }));
  } catch (err) {
    setError(prev => ({ ...prev, posts: 'Failed to load posts' }));
    setLoading(prev => ({ ...prev, posts: false }));
  }
};

  useEffect(() => {
  fetchPosts();
}, []);


  // --- HANDLE POST SUBMIT ---
  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;
    if (!token) {
      alert("You must be logged in to post.");
      return;
    }
    const postData = { content: newPost, type: 'text' };
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/posts",
        postData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Add new post at the top
      setPosts(prevPosts => [response.data.post, ...prevPosts]);
      setNewPost('');
      await fetchPosts();
    } catch (err) {
      console.error("Failed to submit post:", err);
      alert("Error: Could not create post.");
    }
  };

    const handleDeletePost = async (postId) => {
    const token = localStorage.getItem("token");
    if(token){
        try{
        await axios.delete(`http://localhost:3000/api/v1/deletepost/${postId}`, {
            headers: {          
                Authorization: `Bearer ${token}`
            }});
        setPosts(posts.filter(post => post._id !== postId));

        } catch (error) {
            console.error("Error deleting post:", error);
        }
    }
}

  // --- HANDLE LIKE ---
  const handleLike = async (postId) => {
    if (!userId) {
      alert("Login required");
      return;
    }
    // Optimistic update
    setPosts(posts.map(p =>
      p._id === postId
        ? {
          ...p,
          likes: p.likes.includes(userId)
            ? p.likes.filter(id => id !== userId)
            : [...p.likes, userId],
        }
        : p
    ));
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map(p =>
        p._id === postId ? { ...p, likes: res.data.likes } : p
      ));
    } catch (err) {
      console.error("Failed to like post:", err);
      // revert on error
      setPosts(prev => [...prev]);
    }
  };


  // --- RENDER HELPERS ---
  const renderContent = (loadingState, errorState, data, emptyMessage, renderFunction) => {
    if (loadingState) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
    if (errorState) return <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-xl text-center"><p>{errorState}</p></div>;
    if (!data || data.length === 0) return <div className="text-center py-10 text-gray-500"><p>{emptyMessage}</p></div>;
    return renderFunction();
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-lg border-b border-purple-500/20 z-50 shadow-lg shadow-purple-500/10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">DevHub</h1>
              </div>
              <div className="hidden md:flex space-x-2">
                <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${activeTab === 'feed' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>Feed</button>
                <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${activeTab === 'chat' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>Messages</button>
                <button onClick={() => setActiveTab('friends')} className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${activeTab === 'friends' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}>Network</button>
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <div className=" flex pr-[90px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search DevHub..." className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 w-40 md:w-[550px]" />
              </div>
              <button className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
             
<button
      className="flex items-center bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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
        </div>
      </nav>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="fixed left-0 w-[450px] h-full bg-black/80 backdrop-blur-xl border-r border-purple-500/20 p-4 overflow-y-auto hidden lg:block">
          <div className="space-y-6 mt-4">
            <div className="bg-black/60 p-5 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <h3 className="text-sm font-semibold text-purple-300 mb-4 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Your Stats</span>
              </h3>
              {loading.stats
                ? <Loader2 className="w-5 h-5 animate-spin text-purple-400 mx-auto" />
                : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Posts</span>
                      <span className="text-pink-400 font-bold text-lg">{userStats.posts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Friends</span>
                      <span className="text-cyan-400 font-bold text-lg">{userStats.friends}</span>
                    </div>
                  </div>
                )
              }
            </div>
            <div className="bg-black/60 p-5 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <h3 className="text-sm font-semibold text-purple-300 mb-4 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Trending</span>
              </h3>
              {renderContent(loading.trending, error.trending, trendingTags, "No trending topics.", () => (
                <div className="space-y-2">
                  {trendingTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between text-sm hover:bg-purple-500/10 p-2 rounded-lg cursor-pointer"
                    >
                      <span className="text-purple-400 font-medium">#{tag}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64 flex-1 min-h-screen">
          <div className="max-w-4xl mx-auto p-6">
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* New Post Box */}
                <div className="bg-black/70 backdrop-blur-xl p-6 rounded-2xl border border-purple-500/30 shadow-xl shadow-purple-500/10">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="What's brewing in your code today?"
                        className="w-full bg-black/40 border border-purple-500/30 text-white placeholder-gray-400 resize-none outline-none text-md p-4 rounded-xl focus:border-purple-500/60 focus:bg-black/60 transition-all duration-300"
                        rows="3"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-2 text-gray-400">
                          <button className="hover:text-purple-400 transition-all p-2 rounded-full hover:bg-purple-500/10"><Code className="w-5 h-5" /></button>
                          <button className="hover:text-cyan-400 transition-all p-2 rounded-full hover:bg-cyan-500/10"><Zap className="w-5 h-5" /></button>
                          <button className="hover:text-pink-400 transition-all p-2 rounded-full hover:bg-pink-500/10"><Sparkles className="w-5 h-5" /></button>
                        </div>
                        <button
                          onClick={handlePostSubmit}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:scale-100"
                          disabled={!newPost.trim()}
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={fetchPosts}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Refresh Posts
                </button>

                {/* Posts Feed */}
                {renderContent(loading.posts, error.posts, posts, "The feed is empty. Be the first to post!", () => (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="bg-black/70 backdrop-blur-xl p-6 rounded-2xl border-2 border-neutral-800  shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group hover:scale-[1.01] transform"
                      >
                        <div className="flex items-start space-x-4">
<div className="rounded-full bg-purple-700 p-3  flex space-x-1 w-12 h-12 items-center justify-center">
  {post.userId?.Bio?.map((b, i) => (
    <span key={i} className="text-black  font-bold text-xl">
      {b.firstname[0].toUpperCase()}
    </span>
  )) || '👤'}
</div>
                         <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
 {post.userId?.Bio?.map((b, i) => (
    <span key={i} className=" font-poppinBold text-neutral-300 font-bold text-lg">
      {b.firstname}
    </span>
  )) || '👤'}                              <span className="text-purple-400 text-sm">@{post.userId?.username|| 'username'}</span>
                              
                              <span className="text-gray-500">•</span>
                              <div className='flex'>
                              <span className="text-gray-400 text-sm">{new Date(post.createdAt).toISOString().split('T')[0]
}</span> </div>
<div className='flex justify-end pl-96'>
{post.userId?._id === userId && <button onClick={() => handleDeletePost(post._id)} className="
  flex items-center justify-center  gap-2
px-4 py-2
  font-semibold text-red-400
  border border-red-500/50 rounded-lg
  hover:bg-red-500/20 hover:text-red-300 hover:border-red-500
  focus:outline-none focus:ring-2 focus:ring-red-500/50
  transition-all duration-300
">
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  Delete
</button>} </div>

                            </div>
                            <p className="text-gray-200 mb-4 leading-relaxed">{post.content}</p>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag) => (
                                  <span
                                    key={tag.id || tag.name}
                                    className="bg-black/60 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-purple-500/20"
                                  >
                                    #{tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center space-x-6 text-gray-400">
                              <button
                                onClick={() => handleLike(post._id)}
                                className="flex items-center space-x-2 hover:text-red-400 transition-all duration-200"
                              >
                                <Heart className="w-5 h-5" />
                                <span className="font-semibold">{post.likes_count || post.likes.length || 0}</span>
                              </button>
                              <button className="flex items-center space-x-2 hover:text-cyan-400 transition-all duration-200">
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-semibold">{post.comments_count || 0}</span>
                              </button>
                                

                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {/* Add other tabs here (chat, friends) if needed */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;