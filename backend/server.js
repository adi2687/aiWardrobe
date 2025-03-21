import express from 'express';
import connect from './db/connection.js';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import UserRoutes from './routes/user_routes.js';
import AuthRoutes from './routes/auth_routes.js';
import GoogleLoginRoutes from './routes/auth.google.js'
// import facebookLoginRoutes from './routes/auth.facebook.js'
import ShopRoutes from './routes/shop.routes.js'
import jwt from 'jsonwebtoken';
import session from "express-session";
import passport from "passport";
import path from 'path';
import cors from 'cors'
dotenv.config();

const SECRET_KEY = process.env.secret_key;
const app = express();
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin
    credentials: true, // Allow cookies to be sent
  })
);
const PORT = process.env.PORT;

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

connect();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/models', express.static(path.join(__dirname, 'models')));

// Main route
app.get('/', (req, res) => {
    res.send('This is the main page');
});

// Use routes
app.use('/user', UserRoutes);
app.use('/auth', AuthRoutes);
app.use("/google",GoogleLoginRoutes)
app.use("/shop",ShopRoutes)
// app.use('/auth/facebook',facebookLoginRoutes)
// Start the server
app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from Node.js backend!" });
});

app.get("/user/profilemain", (req, res) => {
  console.log("User profile endpoint hit!");
  res.json({ message: "Test response from backend" });
});



app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
