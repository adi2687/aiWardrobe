import { Timestamp } from "bson";
import mongoose from "mongoose";
import { type } from "os";
import { number } from "zod";

const userSchema=new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    profileImageURL:{type:String , default:'./profileImage/default.png'},
    wardrobe:{type:[String],default: []},
    clothes:{type:[String],default:[]},
    clothessuggestionforweek:{type:String},
    favourites:{type:[String],default:[]},
    age:{type:Number},
    gender:{type:String},
    preferences:{type:String}
},{timestamps:true})

const User=mongoose.model('User',userSchema)

export default User