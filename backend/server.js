import express from 'express';
import connect from './db/connection.js';

import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import UserRoutes from './routes/user_routes.js';
import AuthRoutes from './routes/auth_routes.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const SECRET_KEY = process.env.secret_key;
const app = express();

app.use(cookieParser());

const PORT = process.env.PORT;
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

// Start the server
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
