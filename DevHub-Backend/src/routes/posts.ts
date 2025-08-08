import { post } from "../db";
import { createPost } from "../utils/createPost";
import { deleted } from "../utils/deletePost";
import { getPost } from "../utils/getPost";
import { postZod } from "../utils/postZod";
import {Request, Response} from "express";
import mongoose from "mongoose";

export class AuthController{
    static async    newPost(req: Request, res: Response) {
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
  static async likePost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const userId = (req as any).userId;

      // Validate ObjectId
      if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: "Invalid or missing Post ID" });
      }

      const postDoc = await post.findById(postId);
      if (!postDoc) {
        return res.status(404).json({ message: "Post not found" });
      }

      const alreadyLiked = postDoc.likes.some(
        (id) => id.toString() === userId
      );

      if (alreadyLiked) {
        postDoc.likes = postDoc.likes.filter(
          (id) => id.toString() !== userId
        );
      } else {
        postDoc.likes.push(userId);
      }

      await postDoc.save();

      res.status(200).json({
        message: alreadyLiked ? "Post unliked" : "Post liked",
        likes: postDoc.likes, // updated likes array
      });
    } catch (err) {
      console.error("Error in likePost:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async deletPost (req: Request, res: Response) {
    const postId = req.body?.postId || req.params?.postId || req.query?.postId;
    try{
        const post = await deleted(postId);
        if(!post) return res.status(404).json({mesage: "Post not founded"});
        return res.status(200).json({message: "Post deleted successfully"});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
  }
}
