import { Request, Response } from "express";
import { MessageCreate } from "../utils/createMessage";
import { MessageSeen } from "../utils/acceptMessage";

export class AuthController{
    static async sendMessage (req: Request, res: Response){
        const senderId = (req as any).userId;
        const { receiverId } = req.body;
        const { text } = req.body;

        try{

            // create message & check friendShip
            const messages = await MessageCreate(senderId, receiverId, text);
            if(!messages) return res.status(411).json({message: "unable to send the message"});

            return res.status(200).json({message: "message send successfully"})
        } catch (error){
            return res.status(500).json({message: "Internal server error"});
        }
    }

    static async receiveMessage (req: Request, res: Response) {
        const currentuser = (req as any).userId;
        const { senderId } = req.body;
        
        try{
            
            // messageSeen
            const messages = await MessageSeen(currentuser, senderId);
            if(!messages) return res.status(411).json({message: "message not found"})

            return res.status(200).json({mesage: "message seen"})
        } catch (error) {
            return res.status(500).json({message: "Internal server error"})
        }
    }
}
