import { createPost } from "../utils/createPost";
import { getPost } from "../utils/getPost";
import { postZod } from "../utils/postZod";
import {Request, Response} from "express";

export class AuthController{
    static async newPost(req: Request, res: Response) {
        const {content, type} = req.body;

        // check post zod
        const result = postZod.safeParse(req.body);
        if(!result) return res.status(411).json({message: "Body field required"});

        // create post
        const post: any = await createPost(content, type, (req as any).userId);
        if(post) return res.status(200).json({message: "content created successfully", post: post});
        res.status(409).json({message: "unable to create post"});
    }

    static async getPost(req: Request, res: Response) {
        try{
            const posts = await getPost();
            res.status(200).json({ posts });
        } catch (error) {
            res.status(500).json({ message: "Internal server error"});
        }
    }
}
