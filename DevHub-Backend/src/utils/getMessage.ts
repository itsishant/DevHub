import { message } from "../db";
import { friends } from "./existFriend";

export const getMessages = async (userId1: string, userId2: string) => {
    try {
        // Check if users are friends first
        const isFriend = await friends(userId1, userId2);
        if (!isFriend) {
            return null;
        }

       const messages = await message.find({
    $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
    ]
}).sort({ createdAt: 1 });

        return messages;
    } catch (error) {
        console.error("Error getting messages:", error);
        throw error;
    }
};