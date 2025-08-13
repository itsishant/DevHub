import { useState, useEffect } from 'react';
import {
  Search, Bell, MessageCircle, Heart, Share2, Settings, Send,
  Users, Code, Zap, Sparkles, User, Loader2,
  UserPlus,
  User2,
  User2Icon,
  UserCircle,
  CircleUser,
  SearchCheckIcon,
  SearchIcon
} from 'lucide-react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react"

export const Dashboard = () => {
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
  const [like, setLike] = useState({});
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

  // --- HANDLE LIKE (FIXED VERSION) ---
  const handleLike = async (postId) => {
    if (!userId) {
      alert("Login required");
      return;
    }

    // Find the current post to check if user already liked it
    const currentPost = posts.find(p => p._id === postId);
    const isCurrentlyLiked = currentPost?.likes?.includes(userId);

    // Update the like state immediately for UI feedback
    setLike(prev => ({
      ...prev,
      [postId]: !isCurrentlyLiked
    }));

    // Optimistic update for posts
    setPosts(prevPosts => prevPosts.map(p =>
      p._id === postId
        ? {
            ...p,
            likes: isCurrentlyLiked
              ? p.likes.filter(id => id !== userId)
              : [...(p.likes || []), userId],
          }
        : p
    ));

    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update with server response
      setPosts(prevPosts => prevPosts.map(p =>
        p._id === postId ? { ...p, likes: res.data.likes } : p
      ));
      
      // Update like state based on server response
      setLike(prev => ({
        ...prev,
        [postId]: res.data.likes.includes(userId)
      }));
      
    } catch (err) {
      console.error("Failed to like post:", err);
      
      // Revert optimistic updates on error
      setLike(prev => ({
        ...prev,
        [postId]: isCurrentlyLiked
      }));
      
      setPosts(prevPosts => prevPosts.map(p =>
        p._id === postId
          ? {
              ...p,
              likes: isCurrentlyLiked
                ? [...(p.likes || []), userId]
                : p.likes.filter(id => id !== userId),
            }
          : p
      ));
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
    <motion.div
    className="min-h-screen bg-black text-white font-sans">
      {/* Navigation Header */}
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
                </h1>
              </div>
              <div className="hidden md:flex space-x-2">
                <button 
                  onClick={() => setActiveTab('feed')} 
                  className={`px-4 py-2 rounded-lg transition-all hover:text-white duration-200 text-sm font-medium ${
                    activeTab === 'feed' 
                      ? ' text-white' 
                      : 'text-slate-300 '
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
                
                  onClick={() => {navigate("/explore")}} 
                  className={`px-4 flex items-center hover:text-white  py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    activeTab === 'friends' 
                     ? ' text-white' 
                      : 'text-neutral-400 '
                  }`}
                >
                 <SearchIcon className='size-6 pr-2'/> Explore
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex relative pr-[95px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search DevHub..." 
                  className="bg-slate-800 border border-slate-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-64 md:w-80" 
                />
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
      className="pt-16 flex">
        {/* Sidebar */}
        <motion.aside 
        
      initial={{opacity:0, x:-4}}
      animate={{opacity:1, x:0}}
      transition={{duration: 0.6, ease:"easeInOut"}}
        className="fixed w-[360px] h-full bg-slate-900 border-r border-slate-700 p-6 overflow-y-auto hidden lg:block">
          <div className="space-y-6 mt-4">
            {/* Stats Card */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span>Your Stats</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Posts</span>
                  <span className="text-blue-400 font-bold text-lg">{posts ? posts.filter(post => post.userId?._id === userId).length : 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Friends</span>
                  <span className="text-purple-400 font-bold text-lg">{friends.length}</span>
                </div>
              </div>
            </div>

            {/* Trending Card */}
             <div className="bg-slate-800 pb-2 p-6 rounded-xl border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Trending</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between hover:bg-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                  <div className="flex-1">
                    <span className="text-blue-400 font-medium text-sm">#ReactJS</span>
                    <div className="text-xs text-slate-400 mt-1">12.5K posts</div>
                  </div>
                  <div className="text-xs text-green-400 font-medium">↗ 15%</div>
                </div>
                
                <div className="flex items-center justify-between hover:bg-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                  <div className="flex-1">
                    <span className="text-blue-400 font-medium text-sm">#JavaScript</span>
                    <div className="text-xs text-slate-400 mt-1">8.9K posts</div>
                  </div>
                  <div className="text-xs text-green-400 font-medium">↗ 8%</div>
                </div>
                
                <div className="flex items-center justify-between hover:bg-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                  <div className="flex-1">
                    <span className="text-blue-400 font-medium text-sm">#Python</span>
                    <div className="text-xs text-slate-400 mt-1">7.2K posts</div>
                  </div>
                  <div className="text-xs text-green-400 font-medium">↗ 22%</div>
                </div>
                
                <div className="flex items-center justify-between hover:bg-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                  <div className="flex-1">
                    <span className="text-blue-400 font-medium text-sm">#NodeJS</span>
                    <div className="text-xs text-slate-400 mt-1">5.6K posts</div>
                  </div>
                  <div className="text-xs text-red-400 font-medium">↘ 3%</div>
                </div>
                
                <div className="flex items-center justify-between hover:bg-slate-700 p-3 rounded-lg cursor-pointer transition-colors">
                  <div className="flex-1">
                    <span className="text-blue-400 font-medium text-sm">#WebDev</span>
                    <div className="text-xs text-slate-400 mt-1">4.8K posts</div>
                  </div>
                  <div className="text-xs text-green-400 font-medium">↗ 12%</div>
              
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className=" flex-1 min-h-screen bg-gray-950 pl-[100px]">
          <div className="max-w-3xl mx-auto p-6 ">
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* New Post Box */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-400 resize-none outline-none text-base p-4 rounded-lg focus:border-blue-500 transition-all duration-200"
                        rows="3"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-3 text-slate-400">
                          <button className="hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800">
                            <Code className="w-5 h-5" />
                          </button>
                          <button className="hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-slate-800">
                            <Zap className="w-5 h-5" />
                          </button>
                          <button className="hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-slate-800">
                            <Sparkles className="w-5 h-5" />
                          </button>
                        </div>
                        <button
                          onClick={handlePostSubmit}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!newPost.trim()}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={fetchPosts}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors border border-slate-600"
                >
                  Refresh Posts
                </button>

                {/* Posts Feed */}
                {renderContent(loading.posts, error.posts, posts, "The feed is empty. Be the first to post!", () => (
                  <motion.div
                  initial={{opacity:0, y:0}}
                  animate={{opacity:1, y:0}}
                  transition={{duration:0.3, ease:"easeInOut"}}
                  className="space-y-6">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="bg-slate-900 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-200"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-3 w-12 h-12 flex items-center justify-center">
                            {post.userId?.Bio?.map((b, i) => (
                              <span key={i} className="text-white font-bold text-lg">
                                {b.firstname[0].toUpperCase()}
                              </span>
                            )) || <User className="w-5 h-5 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {post.userId?.Bio?.map((b, i) => (
                                  <span key={i} className="text-white font-semibold text-lg">
                                    {b.firstname}
                                  </span>
                                )) || <span className="text-white font-semibold">Unknown User</span>}
                                <span className="text-slate-400 text-sm">@{post.userId?.username || 'username'}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-400 text-sm">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {post.userId?._id === userId && (
                                <button 
                                  onClick={() => handleDeletePost(post._id)} 
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all duration-200 border border-red-500/30"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                            
                            <p className="text-slate-200 mb-4 leading-relaxed text-base">{post.content}</p>
                            
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map((tag) => (
                                  <span
                                    key={tag.id || tag.name}
                                    className="bg-slate-800 border border-slate-600 text-blue-400 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-700 transition-colors"
                                  >
                                    #{tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-6 pt-2 border-t border-slate-700">
                              <button
                                onClick={() => handleLike(post._id)}
                                className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                                  (like[post._id] || post.likes?.includes(userId)) 
                                    ? "text-red-500" 
                                    : "text-slate-400 hover:text-red-400"
                                }`}
                              >
                                <Heart 
                                  className={`w-5 h-5 transition-all duration-200 ${
                                    (like[post._id] || post.likes?.includes(userId)) ? "fill-red-500" : ""
                                  }`} 
                                />
                                <span className="font-medium">{post.likes?.length || 0}</span>
                              </button>
                              <button className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-medium">{post.comments_count || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
 

      </motion.div>
 <motion.aside
 initial={{opacity:0, x:4}}
 animate={{opacity:1, x:0}}
 transition={{duration: 0.6, ease:"easeInOut"}}
 className="hidden lg:block fixed top-16 right-0 w-[290px] h-screen p-3 bg-slate-900 border-l border-slate-700 flex flex-col justify-between">
  {/* Top scrollable content */}
  <div className="overflow-y-auto">
    <div className="text-neutral-100 font-semibold w-[265px] mt-8 rounded-xl bg-slate-800 p-4 border border-slate-600">
      {/* Heading */}
      <div className="flex items-center justify-center border-b border-slate-600 pb-3">
        <User2 className="mr-2 text-blue-400" />
        <span className="text-lg">Community Rules</span>
      </div>

      {/* Rules */}
      <div className="text-base text-slate-300 mt-6 space-y-4">
        <div className="flex items-start">
          <span className="mr-1">🤝</span>
          <span>Be respectful to everyone</span>
        </div>
        <div className="flex items-start">
          <span className="mr-1">🗣️</span>
          <span>No harassment, hate speech, or trolling</span>
        </div>
        <div className="flex items-start">
          <span className="mr-1">📢</span>
          <span>Post relevant and valuable content</span>
        </div>
        <div className="flex items-start">
          <span className="mr-1">📜</span>
          <span>Follow all platform guidelines</span>
        </div>
      </div>
    </div>
  </div>

  {/* Sticky bottom contact section */}
  <div className="border-t border-slate-600 p-3 mt-[68px]">
    <h3 className="text-lg font-semibold text-neutral-100 mb-2">📬 Contact Us</h3>
    <p className="text-slate-400 text-sm">Have questions or feedback? Reach out:</p>
    <div className="mt-2 space-y-1 text-sm">
      <p>✉️ <a href="mailto:shadowtitan2007@gmail.com" className="text-blue-400 hover:underline">support @shadowtitan2007.com</a></p>
      <p>💬 <a href="#" className="text-blue-400 hover:underline">Live Chat</a></p>
    </div>
  </div>

  <div className="border-t border-slate-600 mt-14 pt-4">
  <div className="flex items-center justify-center text-slate-400 text-sm">
    Made with 
    <Heart className="mx-1 animate-pulse" 
  size={16} 
  fill="#ef4444" 
  stroke="#ef4444" size={16} /> 
    by <span className="ml-1 font-medium text-neutral-200">Ishant</span>
  </div>
</div>

</motion.aside>



    </motion.div>
  );
};
