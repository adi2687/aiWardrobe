import express from "express";
import axios from "axios";

const router = express.Router();
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import process from 'process'
dotenv.config()

// ML service URL from environment variables
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;
const authenticate = (req, res, next) => {
  const token = req.cookies.tokenlogin;

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
console.log(req.user)
    next();
  } catch (error) {
    console.log("error");
    res.status(401).json({ msg: "Token is not valid" });
  }
};
import addtowishlist from "../model/addtowishlist.js";

// Add item to wishlist
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

// Remove item from wishlist
router.post("/removefromwishlist", authenticate, async (req, res) => {
  try {
    const { wishlistId } = req.body;
    const userid = req.user.id;
    
    if (!userid) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    if (!wishlistId) {
      return res.status(400).json({ status: false, msg: "Wishlist item ID is required" });
    }
    
    // Find and delete the wishlist item
    const result = await addtowishlist.findOneAndDelete({ 
      _id: wishlistId,
      userid: userid // Ensure the item belongs to the current user
    });
    
    if (!result) {
      return res.status(404).json({ status: false, msg: "Wishlist item not found or not authorized to remove" });
    }
    
    res.status(200).json({ status: true, msg: "Item removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
});

// Proxy endpoint for Amazon search
router.get("/proxy/amazon", async (req, res) => {
  // Add CORS headers - allow requests from all frontend domains
  const origin = req.headers.origin;
  // List of allowed origins - expanded to include all possible frontend URLs
  const allowedOrigins = [
    'https://outfit-ai-liart.vercel.app',
    'https://outfit-ai.vercel.app',
    'https://ai-wardrobe.vercel.app',
    'https://ai-wardrobe-gamma.vercel.app',
    'https://ai-wardrobe-ten.vercel.app',
    'http://localhost:5173',
    'http://localhost:5000'
  ];
  
  // Set appropriate CORS headers
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'https://outfit-ai-liart.vercel.app');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    console.log(`Proxying Amazon search request for query: ${query}`);
    
    // Make request to ML service
    const gender = req.query.gender || "";
    console.log(`Making request to: ${ML_SERVICE_URL}/shop?query=${query}&gender=${gender}`);
    console.log('user gender is:', gender)
    
    const response = await axios.get(`${ML_SERVICE_URL}/shop`, {
      params: { query, gender },
      timeout: 30000 // 30 second timeout
    });

    // Return the data from ML service
    return res.json(response.data);
  } catch (error) {
    console.error("Error proxying Amazon search:", error.message);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        error: `ML service responded with status: ${error.response.status}`,
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(504).json({ error: "ML service timeout or no response" });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({ error: error.message });
    }
  }
});

// Proxy endpoint for Myntra search
router.get("/proxy/myntra", async (req, res) => {
  // Add CORS headers - allow requests from all frontend domains
  const origin = req.headers.origin;
  // List of allowed origins - expanded to include all possible frontend URLs
  const allowedOrigins = [
    'https://outfit-ai-liart.vercel.app',
    'https://outfit-ai.vercel.app',
    'https://ai-wardrobe.vercel.app',
    'https://ai-wardrobe-gamma.vercel.app',
    'https://ai-wardrobe-ten.vercel.app',
    'http://localhost:5173',
    'http://localhost:5000'
  ];
  
  // Set appropriate CORS headers
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'https://outfit-ai-liart.vercel.app');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    console.log(`Proxying Myntra search request for query: ${query}`);
    
    // Make request to ML service
    const gender = req.query.gender || "";
    console.log(`Making request to: ${ML_SERVICE_URL}/shop_myntra?query=${query}&gender=${gender}`);
    console.log('user gender is:', gender)

    const response = await axios.get(`${ML_SERVICE_URL}/shop_myntra`, {
      params: { query, gender },
      timeout: 30000 // 30 second timeout
    });

    // Return the data from ML service
    return res.json(response.data);
  } catch (error) {
    console.error("Error proxying Myntra search:", error.message);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        error: `ML service responded with status: ${error.response.status}`,
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(504).json({ error: "ML service timeout or no response" });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({ error: error.message });
    }
  }
});

export default router;
