import mongoose from "mongoose";

const chatmessageschema=new mongoose.Schema({
    message:String,
    response:String,
    userId:String
},{timestamps:true})

const ChatMessage=mongoose.model('Chatmessage',chatmessageschema)
export default ChatMessage