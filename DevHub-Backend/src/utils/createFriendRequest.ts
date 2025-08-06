import { friend } from "../db"

export const createRequest = async (fromUser, toUser) => {
    await friend.create({
        fromUser,
        toUser,
        status: "pending",
    })
}
