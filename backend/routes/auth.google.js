import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import dotenv from "dotenv";
import User from "../model/user.js";
import jwt from "jsonwebtoken";
import { profile } from "console";
 
dotenv.config();
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;
const backendUrl=process.env.BACKEND_URL
const frontendurl=process.env.FRONTEND_URL

// Session Middleware (Required for `req.user` to persist)
router.use(
  session({
    secret: SECRET_KEY, 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Change to `true` in production (HTTPS required)
  })
);

// Passport Middleware
router.use(passport.initialize());
router.use(passport.session());

// Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL:  `${backendUrl}/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("profilef rom google",profile)
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
const profilePicture=profile.photos[0].value
        if (!user) {
          user = new User({
            username: profile.displayName,
            email: email,
            password: "google",
            profileImageURL:profilePicture
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

router.get("/login", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect("/google/login");
    }
console.log('user details',req.user)
    const token = jwt.sign({ id: req.user._id,username:req.user.username,email: req.user.email , profilePicture:req.user.profileImageURL}, SECRET_KEY, {
      expiresIn: "24h",
    });

    res.cookie("tokenlogin", token, { httpOnly: true, secure: false, sameSite: "Strict" });

    res.redirect(`${frontendurl}/profile`);
  }
);

router.get("/profile", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({
    username: req.user.username,
    email: req.user.email,
    id: req.user._id,
  });
});

export default router;
