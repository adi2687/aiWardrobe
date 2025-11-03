import express from "express";
import User from "../model/user.js";
import authenticate from "../middleware/auth.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const router = express.Router();
const upload = multer();
router.post("/", authenticate, upload.single("image"), async (req, res) => {
  const image = req?.file?.buffer;
  const userid = req.user.id; 
  try {
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const imageBase64 = image.toString("base64");

    const dataUri = `data:image/jpeg;base64,${imageBase64}`;

    try {
      const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: "image",
        folder: "images",
      });
      user.selfimages.push(result.secure_url);
    await user.save();
    } catch (error) {
      console.error("Image upload to Cloudinary failed:", error);
      return res.status(500).json({ error: "Image upload failed." });
    }
    
    res.json({ msg: "Image uploaded successfully" }).status(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
