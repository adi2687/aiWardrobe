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
import session from "express-session";
import passport from "passport";
import path from 'path';
import cors from 'cors';
import connectCloudinary from '../db/cloudinary.js'

dotenv.config();
// console.log("GOOGLE_CLIENT from env:", process.env.GOOGLE_CLIENT);
const frontendUrl=process.env.FRONTEND_URL
console.log(frontendUrl)
const mongoUri=process.env.MONGO_URI
const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: frontendUrl,
    credentials: true,
  },
});

// Expanded allowedOrigins array to include all possible frontend URLs
const expandedAllowedOrigins = [
  // ...allowedOrigins,
  'https://outfit-ai-liart.vercel.app',
  'https://outfit-ai.vercel.app',
  'https://ai-wardrobe.vercel.app',
  'https://ai-wardrobe-gamma.vercel.app',
  'https://ai-wardrobe-ten.vercel.app',
];

// Configure CORS for preflight requests
app.options('*', cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (expandedAllowedOrigins.includes(origin)) {
      callback(null, origin); // ✅ Set actual origin, not true
    } else {
      // For development purposes, allow all origins
      console.log('Origin not in allowlist but allowing:', origin);
      callback(null, origin);
      // In production, you might want to be more restrictive:
      // console.log('Blocked by CORS:', origin);
      // callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));



export { io }; // ✅ Exporting io instance

app.use(cookieParser());

// Apply CORS middleware to all routes
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is in our allowed list
      if (expandedAllowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        // For development purposes, allow all origins
        console.log('Origin not in allowlist but allowing:', origin);
        callback(null, origin);
        // In production, you might want to be more restrictive:
        // console.log('Blocked by CORS:', origin);
        // callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

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
app.get("/", (req, res) => {
  res.send("This is the main page");
});



import clothidentification from '../routes/clothid.js'
app.use('/clothid', clothidentification)
const onlineUsers = {};

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