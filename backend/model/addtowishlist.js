import mongoose from "mongoose";
import { object } from "zod";
const addtowishlistschema=new mongoose.Schema({
    userid:{type:String},
    wishlistitem:{type:Object}

},{timestamps:true})
const addtowishlist=mongoose.model("addtowishlist",addtowishlistschema)
export default addtowishlist