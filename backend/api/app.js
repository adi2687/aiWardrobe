// server.js

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connect from '../db/connection.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import UserRoutes from '../routes/user_routes.js';
import AuthRoutes from '../routes/auth_routes.js';
import GoogleLoginRoutes from '../routes/auth.google.js';
import facebookRoutes from '../routes/auth.facebook.js'
import PasswordResetRoutes from '../routes/password_reset.js';
import ShopRoutes from '../routes/shop.routes.js';
import Chatbot from '../routes/chat.js';
import ShareRoutes from '../routes/share.js'
import ShareToSocialRoutes from '../routes/sharetosocial.js'
import imageGenerateRoute from '../routes/image.js'
import sharetosocial from '../routes/sharetosocial.js'
import generateImage from '../routes/generate-image.js'
import session from "express-session";
import passport from "passport";
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import connectCloudinary from '../db/cloudinary.js'
dotenv.config();
// console.log("GOOGLE_CLIENT from env:", process.env.GOOGLE_CLIENT);
const frontendUrl=process.env.FRONTEND_URL
console.log(frontendUrl)
const mongoUri=process.env.MONGO_URI
// Expanded allowedOrigins array to include all possible frontend URLs
const expandedAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'https://outfit-ai-liart.vercel.app',
  'https://outfit-ai.vercel.app',
  'https://ai-wardrobe.vercel.app',
  'https://ai-wardrobe-gamma.vercel.app',
  'https://ai-wardrobe-ten.vercel.app',
  'http://*:5173',
  'http://192.168.108.14:5173'
];

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: expandedAllowedOrigins,
    credentials: true,
  },
});
// Configure CORS middleware with proper settings
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (expandedAllowedOrigins.includes(origin)) {
      callback(null, true); // ✅ must be true
    } else {
      console.log('Origin not in allowlist but allowing (temp):', origin);
      callback(null, true); // ✅ allow but don’t echo origin string
    }
    
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Configure CORS for preflight OPTIONS requests
app.options('*', cors());



export { io }; // ✅ Exporting io instance

app.use(cookieParser());

// Apply CORS middleware to all routes
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
      
//       // Check if the origin is in our allowed list
//       if (expandedAllowedOrigins.includes(origin)) {
//         callback(null, origin);
//       } else {
//         // For development purposes, allow all origins
//         console.log('Origin not in allowlist but allowing:', origin);
//         callback(null, origin);
//         // In production, you might want to be more restrictive:
//         // console.log('Blocked by CORS:', origin);
//         // callback(null, false);
//       }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     credentials: true,
//   })
// );

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_SECRET_KEY",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // none for cross-origin
    }
    
  })
);

app.use(passport.initialize());
app.use(passport.session());
connectCloudinary();
console.log(mongoUri)
connect(mongoUri);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use('/uploadscloths', express.static(path.join(path.resolve(), 'uploadscloths')));

app.use("/chat", Chatbot);
app.use('/user', UserRoutes);
app.use('/auth', AuthRoutes);
app.use("/google", GoogleLoginRoutes);
app.use("/password", PasswordResetRoutes);
app.use("/shop", ShopRoutes);
app.use("/share", ShareRoutes);
app.use("/imagegenerate",imageGenerateRoute)
app.use("/facebook",facebookRoutes)
app.use("/sharetosocial",sharetosocial)

app.get("/checkcookies", (req, res) => {
  console.log("Cookies:", req.cookies);
  res.json(req.cookies);
});

// generate-image route
// app.get("/generate-image", async (req, res) => {
//   try {
//     const input = req.query.input;
//     if (!input) return res.status(400).json({ msg: "No input provided" });

//     console.log("Input:", input);
//     const response = await generateImage(input,req,res);
//     res.json({ msg: response });
//   } catch (err) {
//     console.error("Error generating image:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });
app.use("/generate-image",generateImage)
// User avatar route for 3D model storage
import UserAvatarRoutes from '../routes/user_avatar.js';
app.use('/ar', UserAvatarRoutes);
app.get("/", (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // Go up from api/ to backend/, then to status-check.html
  const filePath = path.join(__dirname, '..', 'status-check.html');
  res.sendFile(filePath);
  // res.send("This is the main page");
});
import uploadselfimages from '../routes/uploadselfimages.js'
app.use("/uploadselfimages",uploadselfimages)

import getselfimages from '../routes/getselfimages.js'
app.use("/getselfimages",getselfimages)
import defaultimage from '../routes/dewfaultimage.js'
app.use("/defaultimage",defaultimage)
// import vision from '../genAi.js'
// app.use('/vision', vision)
import menuimages from '../routes/menuimages.js'
app.use('/menuimages', menuimages)

import clothidentification from '../routes/clothid.js'
app.use('/clothid', clothidentification)
const onlineUsers = {};

import pinterest from '../routes/pinterset.js'
app.use('/pinterest', pinterest)

import pinterestgenerate from '../routes/pinterestgenerate.js'
app.use("/pinterestgenerate",pinterestgenerate)

import watermarkRoute from '../routes/watermark.js'
app.use("/watermark", watermarkRoute) 

import amazon from '../routes/amazon.js'
app.use("/amazon", amazon) 

import myntra from '../routes/myntra.js'
app.use("/myntra", myntra)

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("join_room", (username) => {
    onlineUsers[username] = socket.id;
    console.log(`${username} joined`);
  });

  socket.on("send_message", (data) => {
    const { sender, recipient, message } = data;
    const receiverSocketId = onlineUsers[recipient];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", {
        sender,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    for (let [key, value] of Object.entries(onlineUsers)) {
      if (value === socket.id) {
        delete onlineUsers[key];
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

export default app;