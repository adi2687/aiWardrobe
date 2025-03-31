require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const FacebookStrategy = require("passport-facebook").Strategy;

const app = express();

// Middleware for sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport.js Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || "2450931771911994",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "4daadd07d1d8c95ee7e934c6e208f983",
      callbackURL: process.env.CALLBACK_URL,
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
app.get("/", (req, res) => {
  res.send('<a href="/auth/facebook">Login with Facebook</a>');
});

// Auth Route
app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

// Callback Route
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

// Profile Route (after login)
app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.send(`<h1>Welcome, ${req.user.displayName}</h1><img src="${req.user.photos[0].value}" alt="Profile Picture"/>`);
});

// Logout Route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
