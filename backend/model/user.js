import { Timestamp } from "bson";
import mongoose from "mongoose";
import { type } from "os";
import { number } from "zod";

const userSchema=new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    profileImageURL:{type:String , default:'./profileImage/default.png'},
    avatarUrl:{type:String}, // Original 3D avatar URL from Ready Player Me
    avatarLocalPath:{type:String}, // Local path to downloaded 3D avatar GLB file (deprecated)
    avatarCloudinaryUrl:{type:String}, // Cloudinary URL for the 3D avatar model
    wardrobe:{type:[String],default: []},
    clothes:{type:[String],default:[]},
    clothessuggestionforweek:{type:String},
    favourites:{type:[String],default:[]},
    age:{type:Number},
    gender:{type:String},
    preferences:{type:String},
    upperwear:{type:[String],default:[]},
    lowerwear:{type:[String],default:[]},
    footwear:{type:[String],default:[]},
    accessories:{type:[String],default:[]}
},{timestamps:true})

const User=mongoose.model('User',userSchema)

export default User