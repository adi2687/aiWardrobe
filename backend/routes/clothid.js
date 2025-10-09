import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import user from '../model/user.js';
import jwt from 'jsonwebtoken';
import vision from '@google-cloud/vision';

dotenv.config();
const router = express.Router();
const upload = multer();

// Initialize Vision client
const client = new vision.ImageAnnotatorClient();

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.cookies.tokenlogin;
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// POST /classify
router.post('/classify', authenticate,upload.single('images'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No image uploaded' });

  let userId = null;
  const token = req.cookies.tokenlogin;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      userId = decoded.id;
    } catch (err) {
      console.log('Token verification failed:', err.message);
    }
  }

  try {
    // Detect objects in image using Vision API
    const [result] = await client.objectLocalization({ image: { content: file.buffer } });
    const objects = result.localizedObjectAnnotations;

    const clothingItems = objects
      .filter(obj => obj.name.toLowerCase().match(/shirt|pants|skirt|dress|shoe|hat|jacket|coat|t-shirt|shorts|blouse|sweater|hoodie|sneakers|boots|bag|accessory/))
      .map(obj => ({
        type: obj.name,
        confidence: obj.score
      }));

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
