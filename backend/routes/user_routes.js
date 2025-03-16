import express from "express";
import jwt from "jsonwebtoken"; // No need to import SECRET_KEY, as it's already in `server.js` and passed as env
import multer from "multer";
const router = express.Router();
import User from "../model/user.js";
import path from "path";
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
router.get("/images", async (req, res) => {
  const tokenlogin = req.cookies.tokenlogin;
  if (!tokenlogin) {
    return res.status(401).json({ error: "No token provided" });
  }

  const decoded = jwt.verify(tokenlogin, process.env.secret_key); // You can use SECRET_KEY from environment
  req.user = decoded;
  // res.send(decoded)
  console.log(req.user);
  try {
    const user = await User.findOne({ username: req.user.username }); // Fetch user from DB
    if (!user) return res.status(404).json({ error: "User not found" });

    // Convert filenames to full URLs
    const wardrobeImages = user.wardrobe;
    const wardrobeClothes = user.clothes;
    console.log("all cloths", wardrobeClothes);
    const allClothes = [];
    let comma = false;
    let cloth = "";
    let k = 0;
    for (let i = 0; i < wardrobeClothes.length; i++) {
      let char = wardrobeClothes[i];
      if (char == ",") {
        allClothes[k++] = cloth.trim();
        cloth = "";
        continue;
      }
      cloth += char;
    }
    if (cloth) {
      allClothes[k++] = cloth.trim();
    }
    console.log("allclothes", allClothes);
    const Wardrobe = {
      wardrobeImg: wardrobeImages,
      wardrobeClothes: wardrobeClothes,
      allclothes:allClothes
    };
    res.send(Wardrobe);
  } catch (error) {
    res.status(500).json({ error: "Error fetching Wardrobe" });
  }
});

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    console.log("Saving file to:", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.post(
  "/upload-image",
  upload.single("wardrobeImage"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const token = req.cookies.tokenlogin;
      if (!token) return res.status(401).json({ error: "No token provided" });

      const decoded = jwt.verify(token, process.env.secret_key);
      console.log("decoded data :", decoded);

      const user = await User.findOne({ username: decoded.username });
      if (!user) return res.status(404).json({ error: "User not found" });

      if (!user.wardrobe) user.wardrobe = [];

      const imageUrl = `/uploads/${req.file.filename}`;
      user.wardrobe.push(imageUrl);
      await user.save();

      res.json({ message: "Upload successful", imageUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed", details: error.message });
    }
  }
);

router.post("/clothesUpload", async (req, res) => {
  console.log("Clothes upload data:", req.body.clothes); // ✅ Debugging log

  if (!req.body.clothes) {
    return res.status(400).json({ error: "No clothes data received" });
  }

  const uploadclothes = req.body.clothes;
  const token = req.cookies.tokenlogin;

  if (!token) {
    return res.status(401).json({ error: "No token in the headers" }); // ✅ Fixed status code
  }

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY); // ✅ Ensure SECRET_KEY is defined in .env
    console.log("Decoded token:", decode);

    const user = await User.findOne({ username: decode.username });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.clothes.push(uploadclothes);
    await user.save();
    res.status(200).json({
      message: "Clothes data received successfully",
      data: uploadclothes,
    });
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(403).json({ error: "Invalid or expired token" }); // ✅ Handle JWT errors
  }
});

export default router;
