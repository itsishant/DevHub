import { post } from "../db";

export const createPost = async (content: string, type: string, userId: string) => {
    try{
       const newPost = await post.create({content, type, userId});
       const populatedPost = await newPost.populate("userId", "username");
       return populatedPost;
    } catch (error){
        console.log(`Error is ${error}`);
    }
}
