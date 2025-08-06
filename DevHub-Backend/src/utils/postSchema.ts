import { Schema } from "mongoose";
import { Database } from "./dbInfo";

type Post = Pick<Database, "_id" | "userId" | "content" | "type" | "createdAt">

export const postSchema = new Schema <Post> ({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true},
    type: { type: String, enum:['code', 'note', 'link'], required: true},
    createdAt: { type: Date, default: Date.now}
})
