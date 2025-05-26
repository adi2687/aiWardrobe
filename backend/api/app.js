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

// Allow multiple origins for CORS
const allowedOrigins = [
  frontendUrl,
  'https://outfit-ai-liart.vercel.app',
  'https://ai-wardrobe-gamma.vercel.app',
  'http://localhost:5173'
];

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  },
});

export { io }; // ✅ Exporting io instance

app.use(cookieParser());

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(null, true); // Allow all origins in development
      }
    },
    credentials: true
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