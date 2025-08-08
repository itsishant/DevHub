import { Schema } from "mongoose";
import { Database } from "./dbInfo";

type User = Pick<Database, "_id" | "username" | "password" | "Bio" | "Avatar" | "createdAt">

export const userSchema = new Schema <User> ({
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    Bio:[{
        firstname: { type: String, required: true},
        lastname: { type: String, required: true},
        email: { type: String, required: true, unique: true},
        phone: { type: Number, required: true, unique: true},
        skills: [{ type: String }]
    }],
    Avatar: { type: String, default: "" },
    createdAt: { 
        type: String, 
        default: () => {
            const now = new Date();
            return now.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        }
    }
})
