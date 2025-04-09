import { Timestamp } from "bson";
import mongoose from "mongoose";
import { type } from "os";

const userSchema=new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    profileImageURL:{type:String , default:'./profileImage/default.png'},
    wardrobe:{type:[String],default: []},
    clothes:{type:[String],default:[]},
    clothessuggestionforweek:{type:String},
    favourites:{type:[String],default:[]}
},{timestamps:true})

const User=mongoose.model('User',userSchema)

export default User