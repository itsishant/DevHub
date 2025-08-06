import bcrypt from "bcrypt";

export const Hash =  async (password: string, rounds: number) => {
    try{
        return await bcrypt.hash(password, 10);
    }catch(error){
        console.error("Password has error "+error);
    }
}
