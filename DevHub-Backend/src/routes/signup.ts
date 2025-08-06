import express, { Request, Response} from "express";
import { SignUpZod } from "../utils/signupZod";
import { user } from "../db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config";
import { Hash } from "../utils/passwordBcrypt";
import { findUser } from "../utils/findUser";
import { generateToken } from "../utils/createToken";

export class AuthController {
 static async Signup (req: Request, res: Response) {
    const {username, password, Bio, Avatar} = req.body;
    const email = Bio[0].email;
    const phone = Bio[0].phone;

    // check zod
    const result = SignUpZod.safeParse(req.body);
    if(!result.success) return res.status(411).json({message: "Body field required"})

    const existingUser = await findUser(username, email, phone);
    if(existingUser){
          if (existingUser.username === username) {
                    return res.status(409).json({ message: "Username is already taken." });
                }
                if (existingUser.Bio.some(bio => bio.email === email)) {
                    return res.status(409).json({ message: "An account with this email already exists." });
                }
                if (existingUser.Bio.some(bio => bio.phone === phone)) {
                    return res.status(409).json({ message: "An account with this phone number already exists." });
        }
    }
    try{
    
    const Hashed = await Hash(password, 10);
    const users = await user.create({username, password: Hashed, Bio, Avatar});
 
    if(users){
        
        const token = generateToken(users._id.toString());

       return res.status(200).json({
            message: "User created successfully",
            token: token
        })
    }

    } catch(error) {
        console.log("Error "+error);
    }
}
}
