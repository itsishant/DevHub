import { message } from "../db"
import { friends } from "./existFriend";

export const MessageCreate = async (senderId, receiverId, text) => {
    const isFriend = await friends(senderId, receiverId);
    if(!isFriend) return null;
     
    const sendMessage = await message.create({
        senderId,
        receiverId,
        text,
        sentAt: new Date()
    })
    return sendMessage;
}
