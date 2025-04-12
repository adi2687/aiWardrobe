import { OpenAI } from 'openai';
import express from 'express';
import Sharecloth from '../model/Sharecloths.js';
import fs from 'fs';
import path from 'path';

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
      return res.status(404).json({ message: "No cloth found with this shareid" });
    }

    // Check if image is already generated
    if (sharecloth.image) {
      const imagePath = path.resolve('images', sharecloth.image);
      if (fs.existsSync(imagePath)) {
        const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
        const imageUrl = `data:image/png;base64,${imageBase64}`;
        return res.json({ image: imageUrl });
      }
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
    const imageBuffer = Buffer.from(imageBase64, "base64");

    // Save image locally
    const filename = `${shareid}_${Date.now()}.png`;
    const imageDir = path.resolve('images');

    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir);
    }

    const filePath = path.join(imageDir, filename);
    fs.writeFileSync(filePath, imageBuffer);

    // Update DB
    sharecloth.image = filename;
    await sharecloth.save();

    const imageUrl = `data:image/png;base64,${imageBase64}`;
    res.json({ image: imageUrl });

  } catch (error) {
    console.error("Error generating or handling image:", error);
    res.status(500).json({ error: error.message || "Something went wrong." });
  }
});

export default router;
