import express from 'express'
import User from '../model/user.js'
import authenticate from '../middleware/auth.js'
const router =express.Router()

router.get("/",authenticate,async(req,res)=>{
    const userid =req.user.id 
    console.log(userid)
    try{
        const user= await User.findById(userid) 
        if(!user){
            return res.status(404).json({msg:"user not authenticated"})
        } 
        const images=user.selfimages
        const defaultImage=user.selfimagedefault
        res.status(200).json({images:images, defaultImage:defaultImage})
    }catch(err){
        console.log(err)
        res.status(500).json({msg:"Internal server error"})
    }
})

export default router
