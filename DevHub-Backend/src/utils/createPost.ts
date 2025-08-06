import { post } from "../db";

export const createPost = async (content: string, type: string, userId: string) => {
    try{
       const newPost = await post.create({content, type, userId});
       return newPost;
    } catch (error){
        console.log(`Error is ${error}`);
    }
}
