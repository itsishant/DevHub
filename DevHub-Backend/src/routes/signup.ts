import express, { Request, Response} from "express";
import { SignUpZod } from "../utils/signupZod";
import { user } from "../db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config";
import { Hash } from "../utils/passwordBcrypt";
import { findUser } from "../utils/findUser";
import { generateToken } from "../utils/createToken";
import axios from "axios";
import dotenv from 'dotenv';
import { Me } from "../utils/findMe";
dotenv.config();

export class AuthController {
 static async Signup (req: Request, res: Response) {
    const {username, password, Bio, Avatar} = req.body;
    const email = Bio[0].email;

    // check zod
    const result = SignUpZod.safeParse(req.body);
    if(!result.success) return res.status(411).json({message: "Please enter correct details"})

    const existingUser = await findUser(username, email);
    if(existingUser){
          if (existingUser.username === username) {
                    return res.status(409).json({ message: "Username is already taken." });
                }
                if (existingUser.Bio.some(bio => bio.email === email)) {
                    return res.status(409).json({ message: "An account with this email already exists." });
                }
    }
    try{
    
    const Hashed = await Hash(password, 10);
    const users = await user.create({username, password: Hashed, Bio, Avatar});
 
    if(users){
        
        const token = generateToken(users._id.toString());

       return res.status(200).json({
            message: "User created successfully",
            token: token,
        })
    }

    } catch(error) {
        console.log("Error "+error);
    }
}

static async getMe (req: Request, res: Response) {
    try {
    const foundUser = await Me((req as any).userId);

    if (!foundUser) {k
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ UserDetails: foundUser });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

static async verifyEmail (req: Request, res: Response) {
    const ABSTRACT_API_KEY = process.env.API_KEY as string;
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const apiResponse = await axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${email}`);
        if (apiResponse.data.deliverability === 'DELIVERABLE') {
            return res.status(200).json({ status: 'verified', message: 'Email is valid' });
        } else {
            // This catches non-existent users, disposable emails, etc.
            return res.status(422).json({ status: 'error', message: 'Email does not exist' });
        }

    } catch (error) {
        console.error('Error verifying email:', error);
        // This catches network errors or problems with the API service itself.
        return res.status(500).json({ status: 'error', message: 'Could not complete email verification at this time.' });
    }
};

 static async checkUsername(req: Request, res: Response) {
        const { username } = req.body;
        const existingUser = await user.findOne({ username });

        if (existingUser) {
            return res.status(409).json({ message: "Username is already taken." });
        }
        return res.status(200).json({ message: "Username is available." });
    }

    static async checkEmail(req: Request, res: Response) {
        const { email } = req.body;
        const existingUser = await user.findOne({ 'Bio.email': email });

        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        return res.status(200).json({ message: "Email is available." });
    }

    static async getAllUser(req: Request, res: Response) {
        try{
        const users = await user.find();
        if(users) {
            res.status(200).json({User: users});
        }
    } catch(error) {
res.status(500).json({message: "Internal server error"})
    }

}
}
