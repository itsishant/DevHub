// src/services/apiService.ts
import 
import axios from 'axios';

// Define the base URL for your backend
const API_URL = "http://localhost:3000/api/v1";

// Create a new Axios instance with a base URL
const api = axios.create({
  baseURL: API_URL,
});

// VERY IMPORTANT: Axios Request Interceptor
// This function automatically attaches the auth token to every request that needs it.
// It runs before any request is sent.
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage (or wherever you store it after login)
    const token = localStorage.getItem('authToken');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API Service Functions (Mapped to your backend routes) ---

// POSTS
export const getPosts = () => api.get('/content');
export const createPost = (postData: { content: string; type: string }) => api.post('/posts', postData);
// You would add like/comment functions here, e.g., export const likePost = (postId) => api.post(`/posts/${postId}/like`);

// FRIENDS & NETWORK
// Note: Your backend has routes for adding/accepting, but not for GETTING all friends.
// I've added a placeholder for getFriends which you'll need to implement on your backend.
export const getFriends = () => api.get('/friends'); // ** You need to create this GET route on your backend **
export const sendFriendRequest = (userId: string) => api.post('/request', { friendId: userId });
export const acceptFriendRequest = (requestId: string) => api.put('/accept', { requestId });

// MESSAGES & CHAT
export const sendMessage = (receiverId: string, content: string) => api.post('/sendMessage', { receiverId, content });
export const markMessageAsSeen = (chatId: string) => api.put('/seenMessage', { chatId });
// // Note: You also need a GET route to fetch the message history for a chat.
// export const getMessages = (friendId: string) => api.get(`/messages/${friendId}`); // ** You need to create this GET route **

// // USER STATS & TRENDING
// // These are also placeholders you'll need to create on your backend.
// export const getUserStats = () => api.get('/user/stats'); // ** You need to create this GET route **
// export const getTrendingTags = () => api.get('/trending'); // ** You need to create this GET route **

export default api;