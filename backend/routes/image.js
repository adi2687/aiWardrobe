import { OpenAI } from "openai";
import express from "express";
import Sharecloth from "../model/Sharecloths.js";
import { v2 as cloudinary } from "cloudinary";

const nebiusClient = new OpenAI({
  baseURL: "https://api.studio.nebius.com/v1/",
  apiKey: process.env.NEBIUS_API_KEY,
});

const router = express.Router();

router.post("/generate-image", async (req, res) => {
  try {
    const { prompt, shareid } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid or missing prompt" });
    }

    const sharecloth = await Sharecloth.findOne({ shareId: shareid });

    if (!sharecloth) {
      return res
        .status(404)
        .json({ message: "No cloth found with this shareid" });
    }

    // If image already exists, return it
    if (sharecloth.image) {
      return res.json({ image: sharecloth.image });
    }

    // Generate image using Nebius API
    const response = await nebiusClient.images.generate({
      model: "black-forest-labs/flux-dev",
      response_format: "b64_json",
      extra_body: {
        response_extension: "png",
        width: 1024,
        height: 1024,
        num_inference_steps: 30,
        negative_prompt: "",
        seed: -1,
      },
      prompt: prompt,
    });

    const imageBase64 = response.data[0].b64_json;

    // Convert base64 to Data URI for Cloudinary
    const dataUri = `data:image/png;base64,${imageBase64}`;

    // Upload to Cloudinary
    let imageUrl;
    try {
      const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: "image",
        folder: "images",
      });
      imageUrl = result.secure_url;
    } catch (error) {
      console.error("Image upload to Cloudinary failed:", error);
      return res.status(500).json({ error: "Image upload failed." });
    }

    // Save URL in DB
    sharecloth.image = imageUrl;
    await sharecloth.save();

    res.json({ image: imageUrl });
  } catch (error) {
    console.error("Error generating or handling image:", error);
    res.status(500).json({ error: error.message || "Something went wrong." });
  }
});

export default router;
