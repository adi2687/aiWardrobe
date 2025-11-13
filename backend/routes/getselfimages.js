import express from 'express'
import User from '../model/user.js'
import authenticate from '../middleware/auth.js'
const router =express.Router()

router.get("/",authenticate,async(req,res)=>{
    try{
        // Use _id or id - both work with Mongoose
        const userid = req.user._id || req.user.id;
        console.log('Fetching images for user:', userid);
        
        const user = await User.findById(userid);
        if(!user){
            return res.status(404).json({msg:"user not authenticated"});
        } 
        
        const images = user.selfimages || [];
        const defaultImage = user.selfimagedefault || "";
        
        console.log('Found images:', images.length);
        
        res.status(200).json({
            images: images,
            defaultImage: defaultImage
        });
    }catch(err){
        console.error('Error in getselfimages:', err);
        res.status(500).json({msg:"Internal server error", error: err.message});
    }
})

export default router
