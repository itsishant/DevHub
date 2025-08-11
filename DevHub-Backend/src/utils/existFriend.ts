import { friend } from "../db";

export const friends = async (fromUser, toUser) => {
    return await friend.findOne({
        $or:[
            {fromUser, toUser},
            {fromUser: toUser, toUser: fromUser}
        ]
    })
    .populate("fromUser", "_id username Bio")
    .populate("toUser", "_id username Bio");
}
