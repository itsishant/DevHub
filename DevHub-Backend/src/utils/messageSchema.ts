import { Database } from "./dbInfo";
import { Schema } from "mongoose";

type Message = Pick<Database, "_id" | "senderId" | "receiverId" | "text" | "sentAt" | "seen">

export const messageSchema = new Schema <Message> ({
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    text: { type: String, required: true},
    sentAt: { type: Date,  default: Date.now },
    seen: { type: Boolean, default: false}
})
