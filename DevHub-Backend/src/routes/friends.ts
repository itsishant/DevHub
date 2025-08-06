import { Request, Response } from "express";
import { friend } from "../db";
import { friends } from "../utils/existFriend";
import { createRequest } from "../utils/createFriendRequest";
import { friendRequest } from "../utils/accpetFriendReq";

export class AuthController {
    static async addFriend(req: Request, res: Response) {
        const fromUser = (req as any).userId;
        const { toUser } = req.body;

        if(fromUser === toUser) return res.status(400).json({mesage: "Cannot sent the friend request"})
        try{
            const existingRequest = await friends(fromUser, toUser);
            if(existingRequest) return res.status(411).json({message: "Friend request is already exists or already friends"});

            await createRequest(fromUser, toUser);
            return res.status(200).json({message: "friend request is send"})
        } catch(error){
            console.log(`Error is ${error}`)
        }
    }

    static async acceptFriendRequest(req: Request, res: Response) {
        const currentUser = (req as any).userId;
        const { fromUser } = req.body;
        try{
        
        const accept = await friendRequest(fromUser, currentUser);
        if(!accept) return res.status(404).json({message: "Friend request not found"});

        return res.status(200).json({mesage: "Friend request accepted"})

        } catch (error) {
            return res.status(500).json({mesage: `Error accepting the friend request = ${error}`})
        }
    }
}
