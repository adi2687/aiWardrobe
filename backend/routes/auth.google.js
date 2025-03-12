import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import dotenv from "dotenv";
import User from '../model/user.js'
import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser";
dotenv.config();
const router = express.Router();
const SECRET_KEY=process.env.secret_key
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT,   
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: "http://localhost:3000/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

router.get("/login", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/callback",
  passport.authenticate("google", {
    successRedirect: "/google/profile",  
    failureRedirect: "/",              
  })
);

router.get("/profile", async (req, res) => {
  if (!req.user) {
    return res.redirect('/google/login');
  }
  // console.log(req.user)
  
  const username=(req.user.displayName)
  const email=req.user.emails[0].value
  
  const newuser=await User.find({email:email})
  if (newuser){
    const newusercreate=await User.create({username:username,email:email,password:'google'})
    if (newusercreate){
      res.json({message:'user created',data:newusercreate})
      return
    }
    else{
      res.json({message:'user not created',data:newusercreate})
      return
    }
  }
  const token=jwt.sign({username:username,email:email},SECRET_KEY,{'expiresIn':'6h'})
  res.cookie('tokenlogin',token)
  res.json({msg:'user logged in ', token})
});

export default router;
