import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import user from '../model/user.js';
import vision from '@google-cloud/vision';
import OpenAI from 'openai';
import { getTokenFromRequest } from '../utils/tokenHelper.js';

dotenv.config();
const router = express.Router();
const upload = multer();

// Initialize Vision client
const client = new vision.ImageAnnotatorClient();

// Initialize OpenAI client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "<YOUR_SITE_URL>",
    "X-Title": process.env.SITE_NAME || "<YOUR_SITE_NAME>",
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
    
    // Try OpenAI Vision API first
    try {
      // Convert image buffer to base64 for OpenAI
      const imageBase64 = file.buffer.toString('base64');
      const imageMimeType = file.mimetype || 'image/jpeg';

      // Use OpenAI Vision API to analyze the image
      const completion = await openai.chat.completions.create({
        model: "qwen/qwen3-vl-8b-instruct",
        max_tokens: 500,
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

      // Parse OpenAI response
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
    } catch (openaiError) {
      console.error('OpenAI Vision API error:', openaiError);
      // Fallback to Google Cloud Vision API if OpenAI fails
      const [result] = await client.objectLocalization({ image: { content: file.buffer } });
      const objects = result.localizedObjectAnnotations;
      clothingItems = objects
        .filter(obj => obj.name.toLowerCase().match(/shirt|pants|skirt|dress|shoe|hat|jacket|coat|t-shirt|shorts|blouse|sweater|hoodie|sneakers|boots|bag|accessory/))
        .map(obj => ({
          type: obj.name,
          confidence: obj.score
        }));
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
    console.error('Vision API error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

export default router;
