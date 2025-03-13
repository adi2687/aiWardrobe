import express from 'express';
import jwt from 'jsonwebtoken'; // No need to import SECRET_KEY, as it's already in `server.js` and passed as env

const router = express.Router();

router.get("/profile", (req, res) => {
    console.log("Cookies received:", req.cookies);
    const tokenlogin = req.cookies.tokenlogin;

    if (!tokenlogin) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(tokenlogin, process.env.secret_key); // You can use SECRET_KEY from environment
        return res.json({ message: "Success", user: decoded });
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token", error });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("tokenlogin", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successful" });
});

export default router;
