import { connection } from "./utils/connectDB";
import { Database } from "./utils/dbInfo";
import { model } from "mongoose";
import { userSchema } from "./utils/userSchema";
import { friendsSchema } from "./utils/friendSchema";
import { messageSchema } from "./utils/messageSchema";
import { postSchema } from "./utils/postSchema";

// connect to database
connection();

//  model
export const user = model('User', userSchema);
export const friend = model('Friend', friendsSchema);
export const message = model('Message', messageSchema);
export const post = model('Post', postSchema);
