import express from "express";
import { v4 as uuidv4 } from "uuid";
import Share from "../model/Sharecloths.js";
import User from '../model/user.js'
import { getTokenFromRequest } from '../utils/tokenHelper.js';
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
dotenv.config()  
const router = express.Router();
const authenticate = (req, res, next) => {
  const token = getTokenFromRequest(req);
  
  if (!token) {
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

router.post("/", authenticate,async (req, res) => {
  const clothes  = req.body.clothes;
  // console.log(clothes);
  console.log("hello")
  // console.log(req.user.id)
  const id = uuidv4().slice(0, 6); // short ID
  const findcloth=await Share.findOne({sharecloths:clothes})
  if(findcloth){

    let id=findcloth.shareId
    res.json({id})
    return
  }
  const savecloth = await Share.create({ username:req.user.username,shareId: id, sharecloths: clothes });
  savecloth.save();
  res.json({ id });
});

router.get("/:id", async (req, res) => {
  try {
    const shareId = req.params.id;
    
    // Find the shared clothes
    const share = await Share.find({ shareId: shareId });
    
    if (!share || share.length === 0) {
      return res.status(404).json({ msg: "Shared clothes not found" });
    }

    // Try to get user data if authenticated (optional)
    let gender = null;
    let age = null;
    
    const token = getTokenFromRequest(req);
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.id);
        if (user) {
          gender = user.gender || null;
          age = user.age || null;
        }
      } catch (error) {
        // Token invalid or user not found - continue without user data
        console.log("Optional auth failed, continuing without user data");
      }
    }

    res.json({
      username: share[0].username,
      share: share,
      gender: gender,
      age: age
    });
  } catch (error) {
    console.error("Error fetching shared clothes:", error);
    res.status(500).json({ msg: "Failed to fetch shared clothes", error: error.message });
  }
});

export default router;
