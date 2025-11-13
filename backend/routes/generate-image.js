import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import dotenv from "dotenv";
dotenv.config();
import { getTokenFromRequest } from "../utils/tokenHelper.js";
import jwt from "jsonwebtoken";
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import User from "../model/user.js";
import Outfitpreview from "../model/outfit-preview.js";
import axios from "axios"; 

const getUserId = (req) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded.id;
  } catch (err) {
    console.error("Invalid token:", err.message);
    return null;
  }
};
const router = express.Router();
// Make upload optional to support both file and URL methods
const upload = multer();
router.post("/", upload.single("image"), async (req, res) => {
  console.log(req.body)
  console.log(req.file)
  const id=req.body.shareid;
  const usercloth=req.body.usercloth 

  // Validate that either file or imageUrl is provided
  if (!req.file && !req.body.imageUrl) {
    return res.status(400).json({ msg: "Either image file or imageUrl is required" });
  }

  //clothid is the imageurl
  const existing=await Outfitpreview.findOne({shareid:id , imageid:usercloth})

  if(existing){
    return res.json({ msg: "Image already exists" , image:existing.generatedurl}).status(200);
  }
  const response = await generate(req, res);

  res.json({ msg: response });
});
async function generate(req, res) {
  const userid = getUserId(req);
  const id=req.body.shareid;
  if (!userid) {
    return res.json({ msg: "authenticate error" }).status(404);
  }
  const input = req.body.input;
  if (!input) {
    return res.json({ msg: "No input provided" }).status(404);
  }
  
  let imageData;
  let base64Image;
  
  // Support both file upload and image URL
  if (req.file) {
    // Existing file upload path
    imageData = req.file.buffer;
    base64Image = imageData.toString("base64");
  } else if (req.body.imageUrl) {
    // New: Fetch image from URL (handles CORS issues)
    try {
      const imageResponse = await axios({
        method: 'GET',
        url: req.body.imageUrl,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'AI-Wardrobe-App'
        }
      });
      imageData = Buffer.from(imageResponse.data);
      base64Image = imageData.toString("base64");
    } catch (error) {
      console.error("Error fetching image from URL:", error);
      return res.status(500).json({ error: "Failed to fetch image from URL." });
    }
  } else {
    return res.json({ msg: "No image provided (file or imageUrl required)" }).status(404);
  }
  
  console.log("Image data length:", base64Image?.length);
  
  // Fetch clothes image from usercloth URL if provided
  let clothesImageBase64 = null;
  if (req.body.usercloth) {
    try {
      const clothesResponse = await axios({
        method: 'GET',
        url: req.body.usercloth,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'AI-Wardrobe-App'
        }
      });
      const clothesBuffer = Buffer.from(clothesResponse.data);
      clothesImageBase64 = clothesBuffer.toString("base64");
      console.log("Clothes image fetched successfully");
    } catch (error) {
      console.error("Error fetching clothes image:", error);
      // Continue without clothes image if fetch fails
    }
  }
  
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATE_KEY,
  });

  // Build prompt with both images: user image (person) and clothes image
  const prompt = [
    { text: "Put the clothes from the second image onto the person in the first image. Don't remove any clothes the person is already wearing, just add the new clothes on top. Make it look natural and realistic." + (input.trim() ? " " + input : "") },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image, // User image (person)
      },
    },
  ];
  
  // Add clothes image if available
  if (clothesImageBase64) {
    prompt.push({
      inlineData: {
        mimeType: "image/png",
        data: clothesImageBase64, // Clothes image (Pinterest)
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      // fs.writeFileSync("photorealistic_example.png", buffer);

      const imageBase64 = buffer.toString("base64");

      const dataUri = `data:image/jpeg;base64,${imageBase64}`;
      let imageurl;
      try {
        const result = await cloudinary.uploader.upload(dataUri, {
          resource_type: "image",
          folder: "images",
        });
        imageurl=result.secure_url
      } catch (error) {
        console.error("Image upload to Cloudinary failed:", error);
        return res.status(500).json({ error: "Image upload failed." });
      } 
      const outfitpreview=new Outfitpreview({
        userid:userid,
        imageid:req.body.usercloth,
        shareid:id,
        generatedurl:imageurl
      })
      await outfitpreview.save();
      return { msg: "image generated successfully", image:imageurl  };
    }
  }
}

export default router;
