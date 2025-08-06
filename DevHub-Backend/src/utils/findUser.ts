import { user } from "../db"

export const findUser = async (username: string, email?: string, phone?: number) =>{
    return await user.findOne({ username, email, phone })
}
