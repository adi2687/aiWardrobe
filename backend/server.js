// server.js

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connect from './db/connection.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import UserRoutes from './routes/user_routes.js';
import AuthRoutes from './routes/auth_routes.js';
import GoogleLoginRoutes from './routes/auth.google.js';
import ShopRoutes from './routes/shop.routes.js';
import Chatbot from './routes/chat.js';
import jwt from 'jsonwebtoken';
import session from "express-session";
import passport from "passport";
import path from 'path';
import cors from 'cors';

dotenv.config();
const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

export { io }; // ✅ Exporting io instance

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use('/uploadscloths', express.static(path.join(path.resolve(), 'uploadscloths')));

app.use("/chat", Chatbot);
app.use('/user', UserRoutes);
app.use('/auth', AuthRoutes);
app.use("/google", GoogleLoginRoutes);
app.use("/shop", ShopRoutes);

app.get("/", (req, res) => {
  res.send("This is the main page");
});

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
