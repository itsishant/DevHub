import express from "express";
import { AuthController as SignUpController } from "./routes/signup";
import { AuthController as SignInController} from "./routes/signin";
import { AuthController as createPostController} from "./routes/posts";
import { AuthController as getPostController} from "./routes/posts";
import { AuthController as friendController} from "./routes/friends";
import { AuthController as messageController } from "./routes/message";
import { AuthController as receiveMessageContoller } from "./routes/message";
import { AuthController as verifyEmail } from "./routes/signup";
import { AuthController } from "./routes/signup";
import { authMiddleWare } from "./Authmiddleware";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import { createWebSocketServer } from "./scoket";

const app = express();
const server = http.createServer(app);
createWebSocketServer(server);
app.use(cors());
app.use(express.json());

// user controller
app.post("/api/v1/signup", SignUpController.Signup);
app.get('/api/v1/me', authMiddleWare, AuthController.getMe);
app.post('/api/v1/check-username', AuthController.checkUsername);
app.get("/api/v1/getUser", authMiddleWare, AuthController.getAllUser);
app.post('/api/v1/check-email', AuthController.checkEmail);
app.post("/api/v1/verify-email", verifyEmail.verifyEmail);
app.post("/api/v1/signin", SignInController.Signin);
app.post("/api/v1/posts", authMiddleWare, createPostController.newPost);
app.get("/api/v1/content", getPostController.getPost);
app.post("/api/v1/posts/:postId/like", authMiddleWare, getPostController.likePost);
app.delete("/api/v1/deletepost/:postId", authMiddleWare, getPostController.deletPost);

// friend controller
app.post("/api/v1/request", authMiddleWare, friendController.addFriend);
app.put("/api/v1/accept", authMiddleWare, friendController.acceptFriendRequest);
app.put("/api/v1/decline", authMiddleWare, friendController.declineFriendRequest);
app.get("/api/v1/friends", authMiddleWare, friendController.getAllFriends);
app.get("/api/v1/requests", authMiddleWare, friendController.getAllRequest);

// message controller
app.post("/api/v1/sendMessage", authMiddleWare, messageController.sendMessage);
app.get('/api/v1/messages/:friendId', authMiddleWare, messageController.getMessages);
app.put("/api/v1/seenMessage", authMiddleWare, receiveMessageContoller.receiveMessage);

server.listen(3000, () => {
    console.log("HTTP + WebSocket running on port 3000");
})
