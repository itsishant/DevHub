# 🚀 DevHub — Connect • Code • Collaborate
A modern social networking platform designed specifically for developers to connect, share knowledge, and grow together as a community.

---

## 🌟 Features

### 🤝 Developer Networking
- **Friend System** – Send and receive friend requests  
- **Profile Discovery** – Find developers by skills, location, and experience  
- **Smart Suggestions** – Get matched with like-minded developers  

### 💻 Knowledge Sharing
- **Code Snippets** – Share and discover code with syntax highlighting  
- **Developer Notes** – Create and share technical documentation  
- **Real-time Collaboration** – Work together on projects and ideas  

### 💬 Communication
- **Real-time Chat** – Instant messaging with WebSocket support  
- **Direct Messaging** – Chat with your developer friends  
- **Group Discussions** – Join topic-based conversations  
- **Activity Feed** – Stay updated with your network  
- **Online Status** – See who's currently active  

### 📊 Community Features
- **Trending Content** – Discover popular snippets and posts  
- **Skill Endorsements** – Showcase your expertise  
- **Achievements** – Track your learning and contributions  

---

## 🛠️ Tech Stack

### 🧩 Frontend
- **React 18** – Modern UI with hooks and functional components  
- **Tailwind CSS** – Utility-first CSS framework  
- **React Router** – Client-side routing  
- **Axios** – HTTP client for API calls  
- **Socket.io Client** – Real-time WebSocket communication  

### ⚙️ Backend
- **Node.js** – JavaScript runtime  
- **TypeScript** – Type-safe development  
- **Express.js** – Web application framework  
- **Socket.io** – Real-time WebSocket server  
- **MongoDB** – NoSQL database  
- **Mongoose** – ODM with TypeScript support  

### 🔐 Authentication & Security
- **JWT** – Secure token-based authentication  
- **bcrypt** – Password hashing  
- **Rate Limiting** – API protection  
- **Input Validation** – Data sanitization  

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v14 or higher)  
- **TypeScript** (v4.5 or higher)  
- **MongoDB** (v4.4 or higher)  
- **npm** or **yarn** package manager  

### 📥 Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/devhub.git
cd devhub
```

#### 2. Install Dependencies

**Backend Setup:**
```bash
cd backend
npm install
# or
yarn install
```

**Frontend Setup:**
```bash
cd frontend
npm install
# or
yarn install
```

#### 3. Environment Configuration

**Backend (.env):**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/devhub
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devhub

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Socket.io Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env):**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# App Configuration
REACT_APP_NAME=DevHub
```

#### 4. Database Setup

**Start MongoDB:**
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, ensure your connection string is correct in the .env file
```

**Run Database Migrations (if any):**
```bash
cd backend
npm run migrate
# or
yarn migrate
```

#### 5. Start the Application

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm run dev
# or
yarn dev
```

**Terminal 2 - Start Frontend Development Server:**
```bash
cd frontend
npm start
# or
yarn start
```

**Terminal 3 - Start WebSocket Server (if separate):**
```bash
cd backend
npm run socket
# or if integrated with main server, this step may not be needed
```

#### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **WebSocket**: ws://localhost:5000

---

## 📚 Usage Guide

### 🔐 Getting Started
1. **Sign Up**: Create your developer account with email verification
2. **Profile Setup**: Complete your developer profile with skills, bio, and experience
3. **Explore**: Discover other developers and trending content

### 👥 Connecting with Developers
1. **Search**: Use the search feature to find developers by name, skills, or location
2. **Send Friend Requests**: Connect with developers you'd like to network with
3. **Accept/Decline**: Manage incoming friend requests from your notifications

### 💬 Real-time Chat Features
1. **Direct Messages**: 
   - Click on any friend to start a conversation
   - Messages are delivered instantly via WebSocket
   - See typing indicators and read receipts
   
2. **Online Status**:
   - Green dot indicates online users
   - Last seen timestamp for offline users
   
3. **Group Chats**:
   - Create topic-based group discussions
   - Real-time message synchronization
   - Member management and moderation

### 💻 Sharing Knowledge
1. **Code Snippets**:
   - Share code with syntax highlighting
   - Tag snippets by programming language
   - Like and comment on others' code

2. **Developer Notes**:
   - Create technical documentation
   - Markdown support for rich formatting
   - Collaborative editing features

---

## 🏗️ Project Structure

```
devhub/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── socket/
│   │   │   ├── chatHandler.ts
│   │   │   ├── socketAuth.ts
│   │   │   └── socketEvents.ts
│   │   ├── types/
│   │   └── utils/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   ├── Profile/
│   │   │   ├── CodeSnippet/
│   │   │   └── Common/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 🔌 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/me           # Get current user
```

### User Management
```http
GET    /api/users           # Get all users (with pagination)
GET    /api/users/:id       # Get user by ID
PUT    /api/users/:id       # Update user profile
DELETE /api/users/:id       # Delete user account
```

### Friends & Networking
```http
POST   /api/friends/request     # Send friend request
PUT    /api/friends/accept/:id  # Accept friend request
DELETE /api/friends/:id         # Remove friend
GET    /api/friends             # Get friends list
```

### Real-time Chat
```http
GET    /api/chats               # Get chat rooms
POST   /api/chats               # Create new chat
GET    /api/chats/:id/messages  # Get chat messages
POST   /api/chats/:id/messages  # Send message (also via WebSocket)
```

### WebSocket Events
```javascript
// Client to Server
socket.emit('join_room', { roomId, userId });
socket.emit('send_message', { roomId, message, userId });
socket.emit('typing', { roomId, userId, isTyping });

// Server to Client
socket.on('message_received', (data) => { /* handle new message */ });
socket.on('user_joined', (data) => { /* handle user joining */ });
socket.on('user_typing', (data) => { /* handle typing indicator */ });
socket.on('user_online', (userId) => { /* handle online status */ });
```

---

## 🧪 Testing

```bash
# Backend Tests
cd backend
npm run test
npm run test:watch
npm run test:coverage

# Frontend Tests
cd frontend
npm test
npm run test:coverage
```

---

## 🚢 Deployment

### Development Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Production Deployment

**Environment Variables for Production:**
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://yourapp.com
SOCKET_CORS_ORIGIN=https://yourapp.com
```

**Deploy to Heroku, Vercel, or your preferred platform:**
```bash
# Example for Heroku
heroku create devhub-backend
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
git push heroku main
```

---

## 🤝 Contributing

We welcome contributions to DevHub! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Update documentation for new features

---

## 🗓️ Roadmap

- [ ] **Mobile App** – React Native implementation
- [ ] **Video Calling** – WebRTC integration for pair programming
- [ ] **Code Review** – Built-in code review system
- [ ] **Job Board** – Developer job matching
- [ ] **Learning Paths** – Guided skill development
- [ ] **API Integrations** – GitHub, GitLab, Bitbucket sync
- [ ] **AI Suggestions** – Smart code recommendations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author & Contact

- **GitHub**: https://github.com/itsishant
  
---

## 🙏 Acknowledgments

- React community for amazing tools and libraries
- Socket.io team for real-time communication
- MongoDB team for flexible database solutions
- All contributors who help make DevHub better

---

⭐ **If you find DevHub helpful, please give it a star on GitHub!**

*Built with ❤️ for the developer community*
