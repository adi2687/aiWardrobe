import mongoose from "mongoose"; 
const outfitpreviewSchema=new mongoose.Schema({
    userid:{type:String}, 
    imageid:{type:String}, // this is the id of the image uploaded by the user
    shareid:{type:String}, // this is the id of the share in sharing
    generatedurl:{type:String}, // this is the url of the generated image
},{timestamps:true})
const outfitpreview=mongoose.model("outfitpreview",outfitpreviewSchema)
export default outfitpreview
