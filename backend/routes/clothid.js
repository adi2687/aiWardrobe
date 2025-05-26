import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv'
import user from '../model/user.js'
import jwt from 'jsonwebtoken'
dotenv.config()
const router = express.Router();  // Create a new router instance
const upload = multer();  // Initialize multer for handling image uploads
const genAI = new GoogleGenerativeAI("AIzaSyCvp8svujinl7xbwemSZ-2ay0V2INaBV1E");
// Prompt for the AI model
const inputPrompt = `
List all the clothing items visible in this image.
Format each item as:
* Item: Color
Only list items. Do not describe the background or image style.
`;




// Utility function to parse the classified text
function parseClothingList(text) {
  const items = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const match = line.match(/^\*\s*(\w+):\s*(.+)/);
    if (match) {
      items.push({ item: match[1].trim(), color: match[2].trim() });
    }
  }
  return items;
}

// Root route (optional)
router.get("/", (req, res) => {
  res.send("Welcome to the clothing classification API!");
});

// POST route for image classification
router.post("/classify", upload.single("images"), async (req, res) => {
  console.log("Cookies received:", req.cookies);
  // Get token from cookies - this is how it's done in other routes
  const token = req.cookies.tokenlogin;
              
  let userId = null;
  console.log("token found:", token)
  if (token) {
    try {
      // Verify the token using the SECRET_KEY (same as in other routes)
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      userId = decoded.id;
      console.log('User authenticated:', decoded.username);
    } catch (error) {
      console.log('Token verification failed:', error.message);
      // Continue without user authentication
    }
  }
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No image uploaded" });
  }
  console.log("here ub te clasifuicaiton")
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content using the model
    const result = await model.generateContent([
      inputPrompt,
      {
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString("base64"),
        },
      },
    ]);

    // Log the entire result for debugging purposes
    // console.log("Full AI Result:", result);

    // Get the response text by invoking the function
    const responseText = result.response.text();  // Call the text function
    if (typeof responseText !== "string") {
      return res.status(500).json({ error: "AI response is not a string" });
    }

    // Parse the response text into structured clothing items
    const clothingItems = parseClothingList(responseText);
    // console.log("Clothing Items:", clothingItems);
    console.log('clothing items', clothingItems)
    // Send back the classified items'

    const upperwear = []
    const lowerwear = []
    const footwear = []
    const accessories = []

    const checkforupperwear = ['shirt', 'sweater', 'jacket', 'coat', 'blazer', 'dress', 't-shirt', 'polo']
    const checkforlowerwear = [
      'jeans',
      'trousers',
      'shorts',
      'skirts',
      'joggers',
      'leggings',
      'chinos',
      'cargo pants',
      'pants'
    ];

    const checkforfootwear = [
      'sneakers',
      'boots',
      'sandals',
      'loafers',
      'heels',
      'flats',
      'slippers',
      'flip-flops'
    ];

    const checkforaccessories = [
      'watch',
      'belt',
      'scarf',
      'hat',
      'sunglasses',
      'bracelet',
      'necklace',
      'earrings',
      'bag'
    ];

    for (let i = 0; i < clothingItems.length; i += 1) {
      const item = clothingItems[i];
      const { item: clothingItem, color } = item;
      // console.log(clothingItem, color);
      if (checkforupperwear.includes(clothingItem.toLowerCase())) {
        upperwear.push({ item: clothingItem, color: color })
        continue
      }
      if (checkforlowerwear.includes(clothingItem.toLowerCase())) {
        lowerwear.push({ item: clothingItem, color: color })
        continue
      }
      if (checkforfootwear.includes(clothingItem.toLowerCase())) {
        footwear.push({ item: clothingItem, color: color })
        continue
      }
      if (checkforaccessories.includes(clothingItem.toLowerCase())) {
        accessories.push({ item: clothingItem, color: color })
        continue
      }
    }
    console.log('upperwear', upperwear)
    console.log('lowerwear', lowerwear)
    console.log('footwear', footwear)
    console.log('accessories', accessories)
    console.log(userId)
    // Only update user if we have a valid userId
    if (userId) {
      try {
        const usermain = await user.findById(userId);
        if (usermain) {
          // Map the items to the format expected by the model (array of strings)
          usermain.upperwear = upperwear.map(item => `${item.item} (${item.color})`);
          usermain.lowerwear = lowerwear.map(item => `${item.item} (${item.color})`);
          usermain.footwear = footwear.map(item => `${item.item} (${item.color})`);
          usermain.accessories = accessories.map(item => `${item.item} (${item.color})`);
          
          await usermain.save();
          console.log('User wardrobe updated successfully');
        }
      } catch (error) {
        console.error('Error updating user wardrobe:', error);
        // Continue without failing the request
      }
    }
    res.json({
      filename: file.originalname,
      clothing_items: clothingItems,
      
    });

  } catch (err) {
    console.error(`Error processing ${file.originalname}:`, err);
    res.status(500).json({ error: err.message });
  }
});



const authenticate = (req, res, next) => {
  const token = req.cookies.tokenlogin;
  // console.log("toke is ", token)
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // console.log(process.en.SECRET_KEY)
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("suser detail", decoded);
    req.user = decoded;
    console.log("user is ", req.user); // Attach the user object to the request
    next();
  } catch (error) {
    console.log("error");
    res.status(401).json({ msg: "Token is not valid" });
  }
};

router.get("/getitems",authenticate,async (req,res)=>{
const token = req.cookies.tokenlogin;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decoded.id;
    
    // Find the user
    const usermain = await user.findById(userId);
    if (usermain) {
      res.status(200).json({
        upperwear: usermain.upperwear || [],
        lowerwear: usermain.lowerwear || [],
        footwear: usermain.footwear || [],
        accessories: usermain.accessories || []
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: "Invalid token" });
  }
})

export default router;  // Export the router for use in the main app
