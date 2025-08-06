import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Signin = () => {
    // State for username and password fields
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const navigate = useNavigate();

    // State to manage the glowing effect on the focused input field
    const [focusedField, setFocusedField] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit =  async (e) => {
        e.preventDefault();
        // Here you would typically make an API call to your backend to authenticate the user
        console.log('Login attempt with:', formData);
        // Example API call:
        const data = await axios.post("https:localhost:3000/api/v1/users/signin", formData);
        console.log(data);
        // axios.post('/api/users/signin', formData)
        //  .then(response => {
        //      console.log('Login successful:', response.data);
        //      // Handle successful login (e.g., save token, redirect)
        //  })
        //  .catch(error => {
        //      console.error('Login failed:', error);
        //      // Handle login error (e.g., show error message)
        //  });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 relative overflow-hidden">
            {/* Animated Background Elements (reused from Signup page for consistency) */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Signin Form */}
            <div className="relative z-10 bg-black/40 border border-gray-800 p-8 rounded-2xl shadow-2xl w-96 backdrop-blur-lg animate-slideUp">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-light text-white mb-2 animate-fadeIn">Welcome Back</h2>
                    <p className="text-gray-400 text-sm animate-fadeIn animation-delay-500">Sign in to continue to Dev Hub</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="animate-fadeIn animation-delay-700">
                        <label className="block text-gray-300 mb-2 text-sm font-medium">Username</label>
                        <div className="relative">
                            <input 
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField('')}
                                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none ${
                                    focusedField === 'username' 
                                        ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-gray-750' 
                                        : 'border-gray-700 hover:border-gray-600'
                                }`}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div className="animate-fadeIn animation-delay-900">
                        <label className="block text-gray-300 mb-2 text-sm font-medium">Password</label>
                        <div className="relative">
                            <input 
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField('')}
                                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none ${
                                    focusedField === 'password' 
                                        ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-gray-750' 
                                        : 'border-gray-700 hover:border-gray-600'
                                }`}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 font-medium animate-fadeIn animation-delay-1100"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center animate-fadeIn animation-delay-1300">
                    <p className="text-gray-400 text-sm">
                        Don't have an account? 
                        {/* You would typically wrap this in a <Link> from react-router-dom */}
                        <button onClick={() => {
                            navigate("/signup")
                        }} className="text-blue-400 hover:text-blue-300 ml-1 transition-colors duration-300 font-medium">
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>

            <style jsx>{`
                /* These are the same animations from the Signup page for perfect consistency */
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-blob { animation: blob 7s infinite; }
                .animate-slideUp { animation: slideUp 0.8s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; opacity: 0; }

                .animation-delay-500 { animation-delay: 0.5s; }
                .animation-delay-700 { animation-delay: 0.7s; }
                .animation-delay-900 { animation-delay: 0.9s; }
                .animation-delay-1100 { animation-delay: 1.1s; }
                .animation-delay-1300 { animation-delay: 1.3s; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};