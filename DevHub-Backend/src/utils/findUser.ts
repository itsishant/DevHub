import { user } from "../db"

export const findUser = async (username: string, email?: string) =>{
    return await user.findOne({ username, email })
}
