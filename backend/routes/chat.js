import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import ChatMessage from "../model/chatmessage.js";
import jwt from "jsonwebtoken";
import User from "../model/user.js";

dotenv.config();

const router = express.Router();

// Auth middleware
const authenticatemain = (req, res, next) => {
  const token = req.cookies.tokenlogin;
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Get user ID from token
const getUserId = (req) => {
  try {
    const token = req.cookies.tokenlogin;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded.id;
  } catch (err) {
    console.error("Invalid token:", err.message);
    return null;
  }
};

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Helper function to generate AI response
async function generateAIResponse(prompt, model = "gemini-2.5-flash") {
  if (!prompt) {
    console.log("No prompt provided");
    return "";
  }
  try {
    console.log('in the respsone ')
    const response = await ai.models.generateContent({
      model,
      contents: [{ type: "text", text: prompt }],
    });
    
    // Correct extraction
    const output = response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    console.log('AI output:', output);
    return output;
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    return "";
  }
}


// Suggestion route
router.post("/suggestion", async (req, res) => {
  // console.log('in the suggestion')
  try {
    const userid = getUserId(req);
    if (!userid) return res.status(401).json({ msg: "Unauthorized" });

    const { input: prompt, clothes, skinColor, age, gender, weather } = req.body;

    let userdetails = "";
    if (skinColor) userdetails += `Skin color: ${skinColor}. `;
    if (age) userdetails += `Age: ${age}. `;
    if (gender) userdetails += `Gender: ${gender}. `;
    let clothesInfo = clothes ? `I have the following clothes: ${clothes}. ` : "";

    let weatherInfo = "";
    if (weather) {
      weatherInfo = `Weather details: Date: ${weather.date}, Temp: ${weather.temp}°C, Feels like: ${weather.feels_like}°C, Condition: ${weather.weather}.`;
    }

    const finalPrompt = `
You are the world's foremost expert on clothes.
the user task is to
${prompt}
${clothesInfo}
${userdetails}
${weatherInfo}
Keep the response short, direct, and only include necessary recommendations.
    `;
    console.log(finalPrompt)
    const text = await generateAIResponse(finalPrompt, "gemini-2.5-flash");

    // Save chat
    const chatmessage = await ChatMessage.create({ message: prompt, response: text, userId: userid });
    await chatmessage.save();

    res.json({ response: text });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).send("Server Error");
  }
});

// Weekly suggestion route
router.post("/suggestionforweek", async (req, res) => {
  try {
    const { input, clothes, weather } = req.body;

    let weatherInfo = "";
    if (Array.isArray(weather)) {
      weatherInfo = weather
        .map((day) => `Date: ${day.date}, Weather: ${day.weather}, Temp: ${day.temp}°C, Feels like: ${day.feels_like}°C`)
        .join("\n");
    }

    const clothesInfo = clothes ? `Your wardrobe: ${clothes}` : "";

    const finalPrompt = `
You are an expert on clothes.
Suggest outfits for the next week based on:
${input}
${weatherInfo}
${clothesInfo}
Keep responses short and only necessary recommendations.
    `;

    const text = await generateAIResponse(finalPrompt, "gemini-2.5-flash");

    res.json({ response: text });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Chat history
router.get("/chathistory", authenticatemain, async (req, res) => {
  try {
    const userid = req.user.id;
    const chatHistory = await ChatMessage.find({ userId: userid }).sort({ createdAt: -1 });
    res.json({ chatHistory });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Shopping suggestions
router.post("/getshoppingsuggestions", authenticatemain, async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid);
    if (!user) return res.json({ status: false, msg: "User not found" });

    const { preferences, clothes: userClothes, gender } = user;
    let genderInfo = gender ? `Gender: ${gender}` : "";
    let prefInfo = preferences ? `Preferences: ${preferences}` : "";
    let clothesInfo = userClothes.length ? `User wardrobe: ${userClothes.join(", ")}` : "";

    const finalPrompt = `
You are an expert on clothes.
Suggest items the user could buy online based on:
${prefInfo}, ${clothesInfo}, ${genderInfo}
Give the response in a simple dot list format without explanations.
    `;

    const text = await generateAIResponse(finalPrompt, "gemini-2.5-flash");

    res.json({ suggestion: text });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

export default router;
