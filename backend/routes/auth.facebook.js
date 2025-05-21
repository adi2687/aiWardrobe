import express from "express";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../model/user.js";
import jwt from "jsonwebtoken";

// Load environment variables from .env file
dotenv.config();
 
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;
const backendUrl = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;

// Middleware for sessions
router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
router.use(passport.initialize());
router.use(passport.session());

// Configure Passport.js Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || "1785939628619411",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "fee7787307c68bd51e513c6c6eb00d6a",
      callbackURL: `${backendUrl}/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email"], // Request additional info
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Facebook profile received", profile);
        // Check if user email is available
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`;
        const profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            username: profile.displayName,
            email: email,
            password: "facebook", // Placeholder password
            profileImageURL: profilePicture
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        console.error("Error during Facebook Auth:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user
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

// Login Route
router.get("/login", (req, res, next) => {
  console.log("Starting Facebook login...");
  passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
});

// Callback Route
router.get(
  "/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  async (req, res) => {
    console.log("Inside /facebook/callback", req.user);

    if (!req.user) {
      return res.redirect("/facebook/login");
    }

    // Generate JWT token
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

    // Set token as cookie and redirect to frontend
    res.cookie("tokenlogin", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
    });
    res.redirect(`${frontendUrl}/profile`);
  }
);

// Profile Route
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

// Logout Route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Export router
export default router;