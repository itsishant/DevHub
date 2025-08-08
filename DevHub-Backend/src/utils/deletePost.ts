import { post } from "../db";

export const deleted = async (postId: string) => {
    const deleting = await post.findByIdAndDelete(postId);
    return deleting;
}
