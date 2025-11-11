import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import user from '../model/user.js';
import OpenAI from 'openai';
import { getTokenFromRequest } from '../utils/tokenHelper.js';

dotenv.config();
const router = express.Router();
const upload = multer();

// Initialize OpenRouter client (using OpenAI SDK with OpenRouter endpoint)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "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",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": process.env.SITE_NAME || "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
  },
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// POST /classify
router.post('/classify', authenticate,upload.single('images'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No image uploaded' });

  let userId = null;
  const token = getTokenFromRequest(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      userId = decoded.id;
    } catch (err) {
      console.log('Token verification failed:', err.message);
    }
  }

  try {
    let clothingItems = [];
    
    // Use OpenRouter API only
    // Convert image buffer to base64 for OpenRouter
    const imageBase64 = file.buffer.toString('base64');
    const imageMimeType = file.mimetype || 'image/jpeg';

    console.log('Calling OpenRouter API with model: qwen/qwen3-vl-8b-instruct');
    
    // Call OpenRouter API (matching test.js pattern)
    const completion = await openai.chat.completions.create({
      model: "qwen/qwen3-vl-8b-instruct",
      max_tokens: 500, // 👈 Add this line
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this image and identify all clothing items. List each clothing item you can see, including: shirts, t-shirts, pants, jeans, skirts, dresses, shoes, sneakers, boots, hats, jackets, coats, blouses, sweaters, hoodies, shorts, bags, and any other clothing or accessories. Return a JSON array of objects with 'type' and 'confidence' fields for each clothing item found." 
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageMimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    // Parse OpenRouter response (matching test.js pattern)
    console.log('OpenRouter API response:', completion.choices[0].message);
    const openaiResponse = completion.choices[0].message.content;
    
    // Try to parse JSON from the response
    const jsonMatch = openaiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      clothingItems = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback: extract clothing items from text response
      const clothingKeywords = ['shirt', 't-shirt', 'pants', 'jeans', 'skirt', 'dress', 'shoe', 'sneakers', 'boots', 'hat', 'jacket', 'coat', 'blouse', 'sweater', 'hoodie', 'shorts', 'bag', 'accessory', 'blazer', 'tank top', 'crop top', 'cardigan', 'leggings', 'trousers', 'joggers', 'heels', 'flats', 'sandals', 'cap', 'belt', 'scarf', 'watch', 'necklace', 'bracelet'];
      const lowerResponse = openaiResponse.toLowerCase();
      clothingKeywords.forEach(keyword => {
        if (lowerResponse.includes(keyword)) {
          clothingItems.push({ type: keyword, confidence: 0.8 });
        }
      });
    }

    // Categorize
    const upperwear = [], lowerwear = [], footwear = [], accessories = [];
    const categories = {
      upperwear: ['shirt','t-shirt','blouse','sweater','hoodie','jacket','coat','dress','blazer','tank top','crop top','cardigan'],
      lowerwear: ['pants','jeans','shorts','skirt','leggings','trousers','joggers'],
      footwear: ['sneakers','boots','heels','flats','sandals'],
      accessories: ['hat','cap','bag','belt','scarf','watch','necklace','bracelet']
    };

    clothingItems.forEach(item => {
      const name = item.type.toLowerCase();
      if (categories.upperwear.includes(name)) upperwear.push(item);
      else if (categories.lowerwear.includes(name)) lowerwear.push(item);
      else if (categories.footwear.includes(name)) footwear.push(item);
      else if (categories.accessories.includes(name)) accessories.push(item);
    });

    // Save to user if authenticated
    if (userId) {
      const userDoc = await user.findById(userId);
      if (userDoc) {
        userDoc.upperwear = upperwear.map(i => i.type);
        userDoc.lowerwear = lowerwear.map(i => i.type);
        userDoc.footwear = footwear.map(i => i.type);
        userDoc.accessories = accessories.map(i => i.type);
        await userDoc.save();
      }
    }

    res.json({ filename: file.originalname, clothing_items: clothingItems, upperwear, lowerwear, footwear, accessories });
  } catch (err) {
    console.error('OpenRouter API error:', err);
    console.error('Error details:', {
      message: err.message,
      status: err.status,
      code: err.code
    });
    res.status(500).json({ error: 'Failed to process image with OpenRouter API' });
  }
});

export default router;
