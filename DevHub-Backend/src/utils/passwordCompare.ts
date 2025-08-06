import bcrypt from "bcrypt";

export const Compare = async (password: string, existingUser: string) => {
    try{
        return await bcrypt.compare(password, existingUser);
    }catch(error){
        console.log("Error while comparing password "+error);
    }
}
