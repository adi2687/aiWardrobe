// auth.google.js
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../model/user.js";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../utils/emailService.js";

dotenv.config();
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;
const backendUrl = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;

// Only passport logic here, no session middleware here

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `${backendUrl}/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile received", profile);
        const email = profile.emails[0].value;
        const profilePicture = profile.photos[0].value;

        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            username: profile.displayName,
            email: email,
            password: "google",
            profileImageURL: profilePicture
          });
          await user.save();
          
          // Send welcome email to new user
          try {
            await sendWelcomeEmail(email, profile.displayName);
            console.log('Welcome email sent to Google user:', email);
          } catch (emailError) {
            console.error('Failed to send welcome email to Google user:', emailError);
            // Continue with authentication even if email fails
          }
        }
        return done(null, user);
      } catch (error) {
        console.error("Error during Google Auth:", error);
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

router.get("/login", (req, res, next) => {
  console.log("Starting Google login...");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    console.log("Inside /google/callback", req.user);

    if (!req.user) {
      return res.redirect("/google/login");
    }

    const token = jwt.sign(
      {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profilePicture: req.user.profileImageURL,
      },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.cookie("tokenlogin", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
    });
    res.redirect(`${frontendUrl}/profile`);
  }
);

router.get("/profile", (req, res) => {
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