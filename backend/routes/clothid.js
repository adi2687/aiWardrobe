import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv'
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

    // Send back the classified items
    res.json({
      filename: file.originalname,
      clothing_items: clothingItems,
    });

  } catch (err) {
    console.error(`Error processing ${file.originalname}:`, err);
    res.status(500).json({ error: err.message });
  }
});

export default router;  // Export the router for use in the main app
