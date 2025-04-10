import mongoose from "mongoose";

const shareSchema=new mongoose.Schema({
    shareId:{type:String,required:true},
    sharecloths:{type:String,required:true},
    username:{type:String},
    image: { type: String }
})

const Share=mongoose.model('Share',shareSchema);
export default Share
