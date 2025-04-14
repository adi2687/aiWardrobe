import express from "express";
import jwt from "jsonwebtoken"; // No need to import SECRET_KEY, as it's already in `server.js` and passed as env
import multer from "multer";
const router = express.Router();
import User from "../model/user.js";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
const authenticate = (req, res, next) => {
  const token = req.cookies.tokenlogin;
  // console.log("toke is ", token)
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // console.log(process.en.SECRET_KEY)
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("suser detail", decoded);
    req.user = decoded;
    console.log("user is ", req.user); // Attach the user object to the request
    next();
  } catch (error) {
    console.log("error");
    res.status(401).json({ msg: "Token is not valid" });
  }
};
router.get("/profile", (req, res) => {
  console.log("Cookies received:", req.cookies);
  const tokenlogin = req.cookies.tokenlogin;

  if (!tokenlogin) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(tokenlogin, process.env.SECRET_KEY); // You can use SECRET_KEY from environment
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

  const decoded = jwt.verify(tokenlogin, process.env.SECRET_KEY); // You can use SECRET_KEY from environment
  req.user = decoded;
  // res.send(decoded)
  // console.log(req.user);
  try {
    const user = await User.findOne({ username: req.user.username }); // Fetch user from DB
    if (!user) return res.status(404).json({ error: "User not found" });

    // Convert filenames to full URLs
    const wardrobeImages = user.wardrobe;
    const wardrobeClothes = user.clothes;
    // console.log("all cloths", wardrobeClothes);
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
    // console.log("allclothes", allClothes);
    const Wardrobe = {
      wardrobeImg: wardrobeImages,
      wardrobeClothes: wardrobeClothes,
      allclothes: allClothes,
    };
    res.json({ Wardrobe });
  } catch (error) {
    res.status(500).json({ error: "Error fetching Wardrobe" });
  }
});

router.post("/updatepassword", authenticate, async (req, res) => {
  const userid = req.user.id;

  const newpassword = req.body.newpassword;
  if (!newpassword) {
    return res.status(400).json({ error: "Please enter new password" });
  }
  const user = await User.findById(userid);
  user.password = newpassword;
  user.save();
  res.json({ status: true, msg: "Password done" });
});

router.post("/updateinfo", authenticate, async (req, res) => {
  const userid = req.user.id;
  console.log(req.body);
  const age = req.body.age;
  const gender = req.body.gender;
  const prefference = req.body.preferences;
  const user = await User.findById(userid);
  user.age = age;
  user.gender = gender;
  user.preferences = prefference;
  user.save();
  res.json({ status: true, msg: "Info done" });
});

router.get("/getuserdetails", authenticate, async (req, res) => {
  const userid = req.user.id;
  const user = await User.findById(userid);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({
    age: user.age,
    preferences: user.preferences,
    gender: user.gender,
  });
});

import Wishlist from "../model/addtowishlist.js";
router.get("/getwishlist", authenticate, async (req, res) => {
  const id = req.user.id;
  console.log(id);
  const wishlist = await Wishlist.find({ userid: id });
  res.json(wishlist);
});

// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, "../uploads");
//     console.log("Saving file to:", uploadPath);
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const filename = `${Date.now()}-${file.originalname}`;
//     console.log("Generated filename:", filename);
//     cb(null, filename);
//   },
// });

// const upload = multer({ storage });

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname);
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

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log("decoded data :", decoded);

      const user = await User.findOne({ username: decoded.username });
      if (!user) return res.status(404).json({ error: "User not found" });

      if (!user.wardrobe) user.wardrobe = [];

      let imageUrl;
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "uploads",
        });
        imageUrl = result.secure_url;
        console.log(imageUrl);
      } catch (error) {
        console.log("Image upload failed", error);
      }
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
  // console.log("Clothes upload data:", req.body.clothes); // ✅ Debugging log

  // Check if clothes data is sent in the request body
  if (!req.body.clothes) {
    return res.status(400).json({ error: "No clothes data received" });
  }

  const uploadclothes = req.body.clothes;
  const token = req.cookies.tokenlogin;

  // If token is missing, return an error
  if (!token) {
    return res.status(401).json({ error: "No token in the headers" });
  }

  try {
    // Decode the JWT token
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Ensure SECRET_KEY is defined in .env
    // console.log("Decoded token:", decoded);

    // Find the user by their username
    const user = await User.findOne({ username: decoded.username });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("upload clothes:", uploadclothes);
    let finalclothestoupload = "";

    uploadclothes.map((cloth) => {
      finalclothestoupload += `${cloth.item} (${cloth.color}), `;
    });
    console.log('final is ', finalclothestoupload)
    user.clothes.push(finalclothestoupload);
    await user.save();

    // Send success response
    res.status(200).json({
      message: "Clothes data received successfully",
      data: uploadclothes,
    });
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(403).json({ error: "Invalid or expired token" }); // Handle JWT errors
  }
});

import cloth from "../model/cloth.js";
const uploadcloth = multer({ storage });
router.post(
  "/sellcloth",
  authenticate,
  uploadcloth.single("image"),
  async (req, res) => {
    let imageUrl;
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "uploadscloths",
      });
      imageUrl = result.secure_url;
    } catch (error) {
      throw new BadRequestError("Image upload failed");
    }
    const description = req.body.description;
    const price = req.body.price;
    console.log(req.body);
    // console.log("File info:", file);
    console.log("description", description);
    console.log("user info", req.user);
    const uploadclothdb = await cloth.create({
      userid: req.user.id,
      username: req.user.username,
      price: price,
      clothImage: imageUrl,
      description: description,
    });
    if (!uploadclothdb) {
      console.log("couldnt");
      res.json({ msg: "cant insert in the database" });
    }
    console.log("done");
    res.json("File uploaded successfully");
  }
);

router.get("/allClothesSell", authenticate, async (req, res) => {
  console.log("userdetaios", req.user);
  const userid = req.user.id;
  const cloths = await cloth.find({ userid: { $ne: userid } });

  const usercloth = await cloth.find({ userid: userid });
  const clothsdata = { cloths, usercloth };
  res.send(clothsdata);
});

import message from "../model/message.js";

// Use in Route
// In user_routes.js
router.post("/message", authenticate, async (req, res) => {
  try {
    const sender = req.user.username;
    const { message: messagebody, recipient } = req.body;

    // Store in DB
    const messageInsert = await message.create({
      message: messagebody,
      sender,
      recipient,
    });

    // Emit message if recipient is online

    res.json({ msg: "Message sent successfully", message: messageInsert });
  } catch (error) {
    console.error("Error in /message route:", error);
    res
      .status(500)
      .json({ error: "Message sending failed", details: error.message });
  }
});
router.get("/clothsforweek", authenticate, async (req, res) => {
  const userid = req.user.id;

  try {
    const user = await User.findById(userid);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const clothforweekdata = user.clothessuggestionforweek;
    const favourites = user.favourites;
    res.json({ clothforweek: clothforweekdata, favourites: favourites });
  } catch (err) {
    console.error("Error fetching clothes for week:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/copytoprofileweekcloths", authenticate, async (req, res) => {
  const userid = req.user.username;
  console.log("User details of clothes:", userid);

  const user = await User.findOne({ username: userid }); // <- changed to findOne
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // console.log('User is final:', user);
  // console.log('Weekly clothes to save:', req.body.clothesforweek);

  user.clothessuggestionforweek = req.body.clothesforweek;
  await user.save();

  res.status(200).json({ message: "Weekly clothing suggestion saved!" });
});

router.post("/addnewcloths", authenticate, async (req, res) => {
  const userid = req.user.id;
  console.log(req.body);
  const user = await User.findById(userid);
  const clothdata = req.body.clothname;
  if (user.clothes[0]) {
    console.log("saved");
    user.clothes[0] += `\n , ${clothdata} , `;
  } else {
    console.log("not saved");
    user.clothes[0] = clothdata + " ";
  }
  await user.save();

  res.json({ message: "cloth saved to the user" });
});
// Fetch Cloth Details
router.get("/sellcloth/find/:id", async (req, res) => {
  const id = req.params.id;
  const clothid = await cloth.findById(id);
  res.send(clothid);
});

// Fetch Messages
router.get("/message/:username", authenticate, async (req, res) => {
  const receivername = req.params.username;
  const sendername = req.user.username;

  const messages = await message.find({
    $or: [
      { recipient: receivername, sender: sendername },
      { recipient: sendername, sender: receivername },
    ],
  });

  res.send(messages);
});

router.post("/soldcloth/delete/:clothid", async (req, res) => {
  const clothid = req.params.clothid;
  console.log(clothid);
  const clothfind = await cloth.findByIdAndDelete(clothid);
  res.json({ message: "cloth deleted successfully" });
});
// prevent
router.post("/cloth/lovesuggestion/save", authenticate, async (req, res) => {
  const userid = req.user.id;
  console.log(userid);
  const cloths = req.body.clothsuggestion;
  console.log(cloths);
  const user = await User.findById(userid);
  if (!user) {
    res.status(404).json({ msg: "no user found" });
    return;
  }
  if (!user.favourites.includes(cloths)) {
    user.favourites.push(cloths);
  }

  await user.save();
  res.status(200).json({ msg: "Suggestion saved to favourites" });
});

router.post("/cloth/deletefavourite", authenticate, async (req, res) => {
  const userid = req.user.id;
  const cloths = req.body.clothsuggestion;
  const user = await User.findById(userid);
  if (!user) {
    res.status(404).json({ msg: "no user found" });
  }
  user.favourites.pull(cloths);
  await user.save();
  res.status(200).json({ favourite: user.favourites });
});
export default router;
