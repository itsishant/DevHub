import { Request, Response } from "express";
import { SignInZod } from "../utils/SignInZod";
import { findUser } from "../utils/findUser";
import { Compare } from "../utils/passwordCompare";
import { generateToken } from "../utils/createToken";

export class AuthController{
    static async Signin (req: Request, res: Response){
        const { username, password } = req.body;

        // zod sigin
        const result = SignInZod.safeParse(req.body);
        if(!result.success) return res.status(400).json({message: "Body field required"});

        try{

        // check user
        const existingUser = await findUser(username)
        if(!existingUser) return res.status(404).json({ message: "Username not found" })
        
        // compare password   
        const passwordMatch = await Compare(password, existingUser.password)
        if(!passwordMatch) return res.status(401).json({ message: "Invaild credentials" })

        // token sign    
        const token = await generateToken(existingUser._id.toString());
        return res.status(200).json({ message: "Signin successfully", token: token, user: {username: existingUser.username, bio: existingUser.Bio} })

        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
            
        }
    }
}
