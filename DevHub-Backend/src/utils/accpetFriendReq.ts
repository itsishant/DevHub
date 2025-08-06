import { friend } from "../db"

export const friendRequest = async (fromUser, toUser) => {
    return await friend.findOneAndUpdate(
        {fromUser, toUser, status: "pending"},
        {status: "accepted"},
        {new: true}
    )
}
