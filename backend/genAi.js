import vision from '@google-cloud/vision';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
dotenv.config();
import path from 'path';
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);

const router = express.Router();
const upload = multer(); // for parsing multipart/form-data

// Create a Vision client
const client = new vision.ImageAnnotatorClient();

// Analyze image buffer
async function analyzeImage(imageBuffer) {
  const [result] = await client.objectLocalization({ image: { content: imageBuffer } });
  const objects = result.localizedObjectAnnotations;

  // Extract clothing-related objects
  const clothingItems = objects
    .filter(obj => [
      'Shirt', 'Pants', 'Dress', 'Shoes', 'Hat', 'Jacket', 'Skirt', 'Shorts', 'Coat', 'Blazer'
    ].includes(obj.name))
    .map(obj => obj.name);

  return clothingItems;
}

// POST /analyze - upload an image
router.post('/analyze', upload.single('image'), async (req, res) => {
  console.log('in the analyze')
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image uploaded' });

    const clothingItems = await analyzeImage(file.buffer);
    res.json({ clothingItems });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router;
