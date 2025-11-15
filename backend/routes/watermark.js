import express from "express";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Path to logo - adjust this path based on where you place the logo
// Option 1: If logo is in backend/public
const logoPath = path.join(__dirname, "../public/logo_main.png");

// Route to add watermark to an image
router.post("/", async (req, res) => {
  try {
    const { imageUrl, filename } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    // Download the image
    const imageResponse = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(imageResponse.data, "binary");

    // Check if logo file exists, if not, try to use a default or download from frontend
    let watermarkBuffer;
    if (fs.existsSync(logoPath)) {
      watermarkBuffer = await sharp(logoPath).toBuffer();
    } else {
      // Try to download logo from frontend public folder
      try {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const logoResponse = await axios({
          method: "GET",
          url: `${frontendUrl}/logo_main.png`,
          responseType: "arraybuffer",
        });
        watermarkBuffer = Buffer.from(logoResponse.data, "binary");
      } catch (logoError) {
        console.error("Error loading logo:", logoError);
        return res.status(500).json({ error: "Logo file not found" });
      }
    }

    // Resize watermark to be 5% of image height (minimum 30px)
    const imageMetadata = await sharp(imageBuffer).metadata();
    const watermarkHeight = Math.max(30, Math.floor(imageMetadata.height * 0.05));
    const resizedWatermark = await sharp(watermarkBuffer)
      .resize({ height: watermarkHeight, fit: "contain" })
      .toBuffer();

    // Get watermark dimensions
    const watermarkMetadata = await sharp(resizedWatermark).metadata();
    const padding = 10;
    const bgWidth = watermarkMetadata.width + (padding * 2);
    const bgHeight = watermarkMetadata.height + (padding * 2);

    // Create a semi-transparent background for the watermark
    const watermarkWithBg = await sharp({
      create: {
        width: bgWidth,
        height: bgHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0.6 },
      },
    })
      .composite([
        {
          input: resizedWatermark,
          top: padding,
          left: padding,
        },
      ])
      .png()
      .toBuffer();

    // Add watermark to image at top-left
    const watermarkedImage = await sharp(imageBuffer)
      .composite([
        {
          input: watermarkWithBg,
          gravity: "northwest", // top-left
        },
      ])
      .png()
      .toBuffer();

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "watermarked-images",
          resource_type: "image",
          format: "png",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error);
          }
          resolve(result);
        }
      );

      uploadStream.end(watermarkedImage);
    })
      .then((result) => {
        return res.json({
          success: true,
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      })
      .catch((error) => {
        console.error("Error processing image:", error);
        return res.status(500).json({ error: "Failed to process image" });
      });
  } catch (error) {
    console.error("Error in watermark route:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;

