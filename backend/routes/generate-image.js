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
const upload = multer();
router.post("/", upload.single("image"), async (req, res) => {
  console.log(req.body)
  console.log(req.file)
  const id=req.body.shareid;
  const usercloth=req.body.usercloth 

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
  const imagePath = req.file;
  const imageData = imagePath.buffer;
  const base64Image = imageData.toString("base64");
  console.log(base64Image);
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATE_KEY,
  });

  const prompt = [
    { text: "the clothes are these put on these on the user in the image " + input },
    {
      inlineData: {
        mimeType: "image/png",
        data: base64Image,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("photorealistic_example.png", buffer);

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
