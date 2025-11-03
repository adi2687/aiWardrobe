import express from "express";
import User from "../model/user.js"; 
import authenticate from "../middleware/auth.js"; 

const router = express.Router();

router.post("/", authenticate, async (req, res) => { 
  console.log("in the setdaulting")
  const userid = req.user.id; 
  console.log(req)
  const { image } = req.body;

  try {
    if (!image) {
      return res.status(400).json({ msg: "No image URL provided" });
    }

    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.selfimagedefault = image;
    await user.save();

    console.log("Default image set:", user.selfimagedefault);
    return res.status(200).json({
      msg: "Image set as default successfully",
      defaultImage: user.selfimagedefault,
    });
  } catch (error) {
    console.error("Error setting default image:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
