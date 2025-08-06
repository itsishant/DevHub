import { message } from "../db"

export const MessageSeen = async (currentuser, senderId) => {
    const messages = await message.updateMany(
        {senderId: senderId,
        receiverId: currentuser,
        seen: false},
       { $set: {seen : true} }
    )
    return messages;
}
