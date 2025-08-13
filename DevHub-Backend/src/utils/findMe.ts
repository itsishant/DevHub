import { Request, Response } from "express";
import { user } from "../db"

export const Me = async (userId: string) =>{
    return await user.findById(userId).select("-password")
}
