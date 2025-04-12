import express from "express";

const router = express.Router();
import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const token = req.cookies.tokenlogin;

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.secret_key);
    req.user = decoded;
// console.log(req.user)
    next();
  } catch (error) {
    console.log("error");
    res.status(401).json({ msg: "Token is not valid" });
  }
};
import addtowishlist from "../model/addtowishlist.js";
router.post("/addtowishlist", authenticate, async (req, res) => {
  console.log(req.body);
  const userid = req.user.id;
  if (!userid) {
    return res.status(404).json({ msg: "User not found" });
  }
  const addtowishlistmain = await addtowishlist.create({
    userid: userid,
    wishlistitem: req.body,
  });
  addtowishlistmain.save();
  res.status(200).json({ status: true, msg: "Added to wishlist" });
});

export default router;
