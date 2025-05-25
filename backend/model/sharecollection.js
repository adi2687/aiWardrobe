import mongoose from "mongoose";

const sharecollectionSchema = new mongoose.Schema({
    username: String,
    shareid: String,
    sharecloths:String,
    image:String,
    like:{type:Number,default:0},
    likedBy: [{ type: String }] // Array of usernames who have liked this collection

},{timestamps:true})

const sharecollection = mongoose.model("sharecollection", sharecollectionSchema);
export default sharecollection;
