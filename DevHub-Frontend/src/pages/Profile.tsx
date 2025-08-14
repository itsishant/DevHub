import { Bell, Code, Search, User, Mail, AtSign, UserCheck, SearchIcon, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export const Profile = () => {
  const [activeTab, setActiveTab] = useState();
  const [firstName, setFirstName] = useState();
  const [letter, setLetter] = useState();
  const [username, setUserName] = useState();
  const [lastName, setLastName] = useState();
  
  const [email, setEmail] = useState();
  const [skills, setSkills] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const details = response.data.UserDetails;
      const firstLetter = details.Bio[0].firstname[0];
      setLetter(firstLetter);
      setFirstName(details.Bio[0].firstname);
      setLastName(details.Bio[0].lastname);
      setEmail(details.Bio[0].email);
      setUserName(response.data.UserDetails.username);
      setSkills(details.Bio[0].skills);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
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
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-200 mb-2">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {firstName || "User"}
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Manage your profile and showcase your skills
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 border-b border-slate-700/50">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-slate-800/50">
                  <span className="text-5xl font-bold text-white">
                    {letter || "U"}
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {firstName && lastName
                    ? `${firstName} ${lastName}`
                    : "Loading..."}
                </h2>
                <p className="text-purple-400 text-lg font-medium mb-4">
                  {username || "@username"}
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">
                      {email || "Loading email..."}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <AtSign className="w-4 h-4" />
                    <span className="text-sm">
                      {username || "@loading..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  Personal Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Full Name
                    </label>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white">
                      {firstName && lastName
                        ? `${firstName} ${lastName}`
                        : "Loading..."}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Username
                    </label>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white">
                      {username || "Loading..."}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Email Address
                    </label>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-white break-all">
                      {email || "Loading..."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-400" />
                  Skills & Technologies
                </h3>

                <div className="space-y-4">
                  {skills && skills.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className="group relative px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-full text-slate-200 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                        >
                          {skill}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
                      <Code className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400">
                        {skills.length === 0 && firstName
                          ? "No skills added yet"
                          : "Loading skills..."}
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        {skills.length === 0 && firstName
                          ? "Add your skills to showcase your expertise"
                          : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
