import { user } from "../db"

export const findUser = async (username: string) =>{
    return await user.findOne({ username })
}
