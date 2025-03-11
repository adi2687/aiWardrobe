import express from 'express';
import connect from './db/connection.js';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import UserRoutes from './routes/user_routes.js';
import AuthRoutes from './routes/auth_routes.js';
import GoogleLoginRoutes from './routes/auth.google.js'
import jwt from 'jsonwebtoken';
import session from "express-session";
import passport from "passport";
dotenv.config();

const SECRET_KEY = process.env.secret_key;
const app = express();

app.use(cookieParser());

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

// Main route
app.get('/', (req, res) => {
    res.send('This is the main page');
});

// Use routes
app.use('/user', UserRoutes);
app.use('/auth', AuthRoutes);
app.use("/google",GoogleLoginRoutes)
// Start the server
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
