import mongoose, { Schema } from "mongoose";
import { Database } from "./dbInfo";

type Friends = Pick<Database, "_id" | "fromUser" | "toUser" | "status" | "sentAt">

export const friendsSchema = new Schema <Friends> ({
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    status: { type: String, default: "pending"},
    sentAt: { type: Date, default: Date.now}
}) 
