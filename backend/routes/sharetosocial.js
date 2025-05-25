import express from 'express';
import sharecollection from "../model/sharecollection.js";
import sharecloths from "../model/Sharecloths.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.get("/", (req, res) => {
    console.log("sharetosocial base route hit");
    res.json({ message: "Share to social API is working" });
})

const authenticate = (req, res, next) => {
  // Check for token in cookies first
  let token = req.cookies.tokenlogin;
  
  // If no token in cookies, check Authorization header
  if (!token && req.headers.authorization) {
    // Format should be "Bearer [token]"
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) {
    console.log('No token found in cookies or Authorization header');
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    req.user = decoded;
    
    next();
  } catch (error) {
    console.log("error");
    res.status(401).json({ msg: "Token is not valid" });
  }
};

router.post("/sharecollection", authenticate, async (req, res) => {
  const id = req.body.shareurl;
  const sharedclothes=await sharecloths.findOne({shareId:id})
  console.log(sharedclothes)

  if (sharedclothes){
    const savetosocial=await sharecollection.create({username:req.user.username,shareid:id,sharecloths:sharedclothes.sharecloths,image:sharedclothes.image})
    savetosocial.save()
    res.json({id})
  }
  else{
    res.json({message:"No data found"})
  }
})

router.get("/social", async (req, res) => {
  console.log("hit of social - endpoint accessed");
  try {
    const share = await sharecollection.find();
    // console.log("Data retrieved:", share);
    res.json({share: share});
  } catch (error) {
    console.error("Error in /social endpoint:", error);
    res.status(500).json({error: "Server error"});
  }
})

router.get("/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({message: "Test endpoint working"});
})
router.post("/likecollection",authenticate,async (req,res)=>{
    try {
        console.log('liked id', req.body.id);
        const collectionId = req.body.id;
        const username = req.user.username;
        
        // Find the collection by shareid
        const collection = await sharecollection.findOne({ shareid: collectionId });
        
        if (!collection) {
            return res.status(404).json({ error: "Collection not found" });
        }
        
        // Check if user has already liked this collection
        if (collection.likedBy && collection.likedBy.includes(username)) {
            return res.status(400).json({ 
                error: "Already liked", 
                message: "You have already liked this collection",
                likeCount: collection.like
            });
        }
        
        // Increment the like count and add user to likedBy array
        collection.like = (collection.like || 0) + 1;
        
        // Initialize likedBy array if it doesn't exist
        if (!collection.likedBy) {
            collection.likedBy = [];
        }
        
        // Add username to likedBy array
        collection.likedBy.push(username);
        await collection.save();
        
        res.status(200).json({ 
            success: true, 
            message: "Collection liked successfully", 
            likeCount: collection.like,
            alreadyLiked: true
        });
    } catch (error) {
        console.error("Error liking collection:", error);
        res.status(500).json({ error: "Server error" });
    }
})
export default router