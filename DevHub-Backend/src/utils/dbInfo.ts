import { ObjectId } from "mongodb"

export interface Database{
    _id: ObjectId,
    username: string,
    password: string,
    Bio:[
        {
            firstname: string,
            lastname: string,
            email: string,
            skills: string[],
        }
    ],
    Avatar: string,
    createdAt: string,
    fromUser: ObjectId,
    toUser: ObjectId,
    status: string,
    sentAt: Date,
    userId: ObjectId,
    content: string,
    type: string,
    senderId: ObjectId,
    receiverId: ObjectId,
    text: string,
    seen: boolean
    likes: string[]
}
