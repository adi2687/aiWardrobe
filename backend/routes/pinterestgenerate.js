// routes/tryon.js
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";
import OpenAI from "openai";
import axios from "axios";

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// create client helper
function createGenAI() {
  return new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATE_KEY });
}

/**
 * helper: call model with basic retry on 429 (honors retryDelay if provided)
 * - model: string
 * - contents: array as used by Google GenAI (inlineData/text parts)
 * - maxRetries: 3
 */
async function callGenerateContentWithRetry({ model, contents, maxRetries = 3 }) {
  const ai = createGenAI();
  let attempt = 0;
  let lastErr = null;

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
      });
      return response;
    } catch (err) {
      lastErr = err;
      const status = err?.status;
      // if google returns retry info, use it
      const retryInfo = err?.message && (() => {
        try {
          const parsed = JSON.parse(err.message);
          const retryDelay = parsed?.error?.details?.find(d => d["@type"]?.includes("RetryInfo"))?.retryDelay;
          return retryDelay; // string like "28s"
        } catch (e) { return null; }
      })();

      // If 429, wait then retry
      if (status === 429 && attempt < maxRetries) {
        attempt++;
        let waitMs = 2000 * attempt; // exponential backoff base
        // parse retryInfo "28s" -> ms if available
        if (retryInfo && typeof retryInfo === "string") {
          const seconds = parseInt(retryInfo.replace("s", ""), 10);
          if (!isNaN(seconds)) waitMs = seconds * 1000;
        }
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      // non-retryable or exhausted retries -> throw
      throw err;
    }
  }

  throw lastErr;
}


/* ===========================
   STEP 2: /apply
   Accepts: form-data file "image2" (user) and field "clothingDescription" (text from /extract)
   Returns: uploaded image url
   =========================== */ 

router.post("/identify", multer().none(), async (req,res)=>{ 
  try {
    console.log("in the identify route")
    console.log(req.file,req.body)
    const imageurl = req.body.imageurl  
    const userimage = req.body.userimage   
    if(!imageurl || !userimage) {
      console.log("imageurl and userimage are required");
      return res.status(400).json({error: "imageurl and userimage are required"});
    }
    
    // Helper function to convert URL or base64 to base64 string
    async function getBase64Image(input) {
      // If it's already a base64 string (no http/https), use it directly
      if (!input.startsWith('http://') && !input.startsWith('https://')) {
        // Remove data URL prefix if present
        return input.includes(',') ? input.split(',')[1] : input;
      }
      
      // If it's a URL, fetch and convert to base64
      try {
        const response = await axios.get(input, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        return buffer.toString('base64');
      } catch (error) {
        console.error('Error fetching image from URL:', error);
        throw new Error('Failed to fetch image from URL');
      }
    }
    
    const base64imageurl = await getBase64Image(imageurl);
    // userimage is not used in the API call but is required for validation
    const base64userimage = await getBase64Image(userimage);
    
    console.log('Base64 images prepared');
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    const response = await openai.chat.completions.create({
      model: "z-ai/glm-4.5v",
      messages: [
        {role: "user", content: [
          {type: "text", text: "Identify the clothing in the image which is to a model if there is no model present just identify the them from the image and suggets some clothes in the image dont give any other response just the clothing description."},
          {type: "image_url", image_url: {url: `data:image/jpeg;base64,${base64imageurl}`}}
        ]}
      ]
    })
    const applyingurl = await applyclothes(base64userimage,response.choices[0].message.content);
    return res.json({response: applyingurl});
  } catch (error) {
    console.error('Error in /identify route:', error);
    return res.status(500).json({error: error.message || 'Internal server error'});
  }
})
const applyclothes=async (userimage,clothes)=>{
  if (!userimage || !clothes) {
    console.log("userimage and clothes are required");
    return null;
  }
  console.log("userimage and clothes are required", clothes);
  const googlebanana = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATE_KEY,
  });
  const response = await googlebanana.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {text: "Apply the clothes to the user in the image" + clothes},
      {inlineData: {
        mimeType: "image/jpeg",
        data: userimage,
      }},
    ]
  }) 
  console.log("response", response);
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
        return null;
      } 
      return imageurl;
    }
  }
}
export default router;
