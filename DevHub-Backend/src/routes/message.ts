import { Request, Response } from "express";
import { MessageCreate } from "../utils/createMessage";
import { MessageSeen } from "../utils/acceptMessage";
import { getMessages } from "../utils/getMessage";

export class AuthController{
    static async sendMessage (req: Request, res: Response){
        const senderId = (req as any).userId;
const { receiverId, text } = req.body;

        try{
            const messages = await MessageCreate(senderId, receiverId, text);
            if(!messages) return res.status(411).json({message: "unable to send the message"});

            return res.status(200).json({message: "message send successfully"})
        } catch (error){
            return res.status(500).json({message: "Internal server error"});
        }
    }

  static async getMessages(req: Request, res: Response) {
    const currentUser = (req as any).userId;
    const { friendId } = req.params;
    
    if (!friendId) {
        return res.status(400).json({ message: "Friend ID is required" });
    }

    try {
        const messages = await getMessages(currentUser, friendId);
        if (messages === null) {
            return res.status(403).json({ message: "You can only message friends" });
        }

        return res.status(200).json({ messages: messages || [] });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
    static async receiveMessage (req: Request, res: Response) {
        const currentuser = (req as any).userId;
        const { senderId } = req.body;
        
        try{
            const messages = await MessageSeen(currentuser, senderId);
            if(!messages) return res.status(411).json({message: "message not found"})

            return res.status(200).json({message: "message seen"})
        } catch (error) {
            return res.status(500).json({message: "Internal server error"})
        }
    }
}
