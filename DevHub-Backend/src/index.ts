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
import { authMidddleWare } from "./Authmiddleware";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/v1/signup", SignUpController.Signup);
app.post('/api/v1/check-username', AuthController.checkUsername);
app.get("/api/v1/getUser", authMidddleWare, AuthController.getAllUser);
app.post('/api/v1/check-email', AuthController.checkEmail);
app.post("/api/v1/verify-email", verifyEmail.verifyEmail);
app.post("/api/v1/signin", SignInController.Signin);
app.post("/api/v1/posts", authMidddleWare, createPostController.newPost);
app.get("/api/v1/content", getPostController.getPost);
app.post("/api/v1/posts/:postId/like", authMidddleWare, getPostController.likePost);
app.delete("/api/v1/deletepost/:postId", authMidddleWare, getPostController.deletPost);

// friend controller
app.post("/api/v1/request", authMidddleWare, friendController.addFriend);
app.put("/api/v1/accept", authMidddleWare, friendController.acceptFriendRequest);
app.put("/api/v1/decline", authMidddleWare, friendController.declineFriendRequest);
app.get("/api/v1/friends", authMidddleWare, friendController.getAllFriends);
app.get("/api/v1/requests", authMidddleWare, friendController.getAllRequest);

// message controller
app.post("/api/v1/sendMessage", authMidddleWare, messageController.sendMessage);
app.get('/api/v1/messages/:friendId', authMidddleWare, messageController.getMessages);
app.put("/api/v1/seenMessage", authMidddleWare, receiveMessageContoller.receiveMessage);

app.listen(3000, () => {
    console.log("Port is running at 3000");
})

