import { post } from "../db";

export const getPost = async () => {
    return await post.find().populate("userId", "username");
};
