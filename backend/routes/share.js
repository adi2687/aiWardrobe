import express from "express";
import { v4 as uuidv4 } from "uuid";
import Share from "../model/Sharecloths.js";
import User from '../model/user.js'
const router = express.Router();
import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
dotenv.config()  
const authenticate = (req, res, next) => {
  const token = req.cookies.tokenlogin;
  
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
  console.log(clothes);
  console.log(req.user.id)
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

router.get("/:id",async (req, res) => {
  const shareId = req.params.id;
  const share = await Share.find({ shareId: shareId });
  res.json({username:share.username,share:share});
});


export default router;
