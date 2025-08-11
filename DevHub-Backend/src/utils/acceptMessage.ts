import { message } from "../db";

export const MessageSeen = async (currentuser: string, senderId: string) => {
    const updateResult = await message.updateMany(
        // Use the correct field names from your schema
        { senderId: senderId, receiverId: currentuser, seen: false },
        { $set: { seen: true } }
    );
    return updateResult;
};