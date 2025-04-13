import express from "express";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
import { Strategy as FacebookStrategy } from "passport-facebook";

// Load environment variables from .env file
dotenv.config();

const router = express.Router();

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
      clientID: "2450931771911994", // Corrected env variable
      clientSecret: "4daadd07d1d8c95ee7e934c6e208f983", // Corrected env variable
      callbackURL: "http://lcoalhost:5000/user/profile",
      profileFields: ["id", "displayName", "photos", "email"], // Request additional info
    },
    function (accessToken, refreshToken, profile, done) {
      // Here, save user to database or create session
      return done(null, profile);
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes
router.get("/", (req, res) => {
  console.log("hey")
  res.send('<a href="/auth/facebook">Login with Facebook</a>');
});

// Auth Route
router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

// Callback Route
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

// Profile Route (after login)
router.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.send(`<h1>Welcome, ${req.user.displayName}</h1><img src="${req.user.photos[0].value}" alt="Profile Picture"/>`);
});

// Logout Route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Export router
export default router;
