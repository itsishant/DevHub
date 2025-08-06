import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./utils/config";

export const authMidddleWare = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "token is missing or invaild"});
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET) as {id : string};
        (req as any).userId = decoded.id;
        next(); 
    } catch (error){
        console.log(`Error is ${error}`);
    }
}
