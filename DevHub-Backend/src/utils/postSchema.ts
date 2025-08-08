import { Schema } from "mongoose";
import { Database } from "./dbInfo";

type Post = Pick<Database, "_id" | "userId" | "content" | "type" | "createdAt" | "likes">

export const postSchema = new Schema <Post> ({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true},
    type: { type: String, enum:['code', 'note', 'link', 'text'], required: true},
    createdAt: { 
  type: String, 
  default: () => {
    const now = new Date();
    return now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
},
likes: [{type: Schema.Types.ObjectId, ref: "User", default: []}],

})
