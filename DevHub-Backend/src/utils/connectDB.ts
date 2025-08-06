import mongoose, { Mongoose } from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export const connection = async function(){
    try{
    await mongoose.connect(process.env.MONGO_URL as string) ;
    console.log("Connected to db");
    }catch (error){
        console.error("Error "+error);
    }
}
