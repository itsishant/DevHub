import express from "express";
import { AuthController as SignUpController } from "./routes/signup";
import { AuthController as SignInController} from "./routes/signin";
import { AuthController as createPostController} from "./routes/posts";
import { AuthController as getPostController} from "./routes/posts";
import { AuthController as friendController} from "./routes/friends";
import { AuthController as messageController } from "./routes/message";
import { AuthController as receiveMessageContoller } from "./routes/message";
import { authMidddleWare } from "./Authmiddleware";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/v1/signup", SignUpController.Signup);
app.post("/api/v1/signin", SignInController.Signin);
app.post("/api/v1/posts", authMidddleWare, createPostController.newPost);
app.get("/api/v1/content", getPostController.getPost);
app.post("/api/v1/posts/:postId/like", authMidddleWare, getPostController.likePost);
app.delete("/api/v1/deletepost/:postId", authMidddleWare, getPostController.deletPost);
app.post("/api/v1/request", authMidddleWare, friendController.addFriend);
app.put("/api/v1/accept", authMidddleWare, friendController.acceptFriendRequest);
app.post("/api/v1/sendMessage", authMidddleWare, messageController.sendMessage);
app.put("/api/v1/seenMessage", authMidddleWare, receiveMessageContoller.receiveMessage);

app.listen(3000, () => {
    console.log("Port is running at 3000");
})

