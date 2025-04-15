import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import e from "express";
import ChatMessage from "../model/chatmessage.js";
// import { authenticate } from "passport";

dotenv.config();

import jwt from "jsonwebtoken";
// import { authenticate } from "passport";
const authenticatemain = (req, res, next) => {
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

const genAI = new GoogleGenerativeAI("AIzaSyB0aSbmzg8eDP9ZCRpzaJQIDlGk_ewBgnU");
const router = express.Router();

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

router.post("/chatbot", async (req, res) => {
  try {
    const userId = getUserId(req);
    const prompt = req.body.input;
    const clothes = req.body.userClothes || "";
    const weather = req.body.weather;

    const clothesPrompt = clothes
      ? `I have the following clothes with me: ${clothes}. Suggest me a short and concise outfit recommendation based on this.`
      : "";

    const weatherPrompt = weather
      ? `Weather details:
    - Date: ${weather.date}
    - Temperature: ${weather.temp}°C (Min: ${weather.temp_min}°C, Max: ${weather.temp_max}°C)
    - Feels Like: ${weather.feels_like}°C
    - Condition: ${weather.weather}
    - Wind Speed: ${weather.wind} m/s
    - Humidity: ${weather.humidity}%
    - Rain Probability: ${weather.rain_probability}%
    - Cloud Cover: ${weather.cloud_cover}%
    
    Suggest clothing suitable for these conditions.`
      : "";

    // 🗨️ Fetch last 5 messages from this user to continue context
    const previousMessages = await ChatMessage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 🧠 Convert previous messages into Gemini format
    const history = previousMessages
      .reverse() // Chronological order
      .map((msg) => [
        { role: "user", parts: [{ text: msg.message }] },
        { role: "model", parts: [{ text: msg.response }] },
      ])
      .flat();

    // Add the new message
    const currentPrompt = `
${prompt}
${clothesPrompt}
${weatherPrompt}

Respond in a short, clear sentence and suggets some outfits or any question that the user asks
`;
    console.log(currentPrompt);
    history.push({ role: "user", parts: [{ text: currentPrompt }] });

    // 🎯 Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generationConfig = {
      temperature: 0.9,
      topK: 5,
      topP: 0.9,
      maxOutputTokens: 2048,
    };

    const result = await model.generateContent({
      contents: history,
      generationConfig,
    });

    const response = result.response;
    const rawText = response.text();
    const cleanedText = rawText.replace(/\*/g, "").replace(/<.*?>/g, "").trim();

    // 📝 Save to chat history
   

    res.json({ response: cleanedText });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).send("Server Error");
  }
});

router.post("/suggestionforweek", async (req, res) => {
  console.log("for week", req.body);

  const weather = req.body.weather;
  const input = req.body.input;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const clothes = req.body.clothes || "";
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };
  const title = "clothes";
  let weatherinprompt = "";
  if (Array.isArray(weather)) {
    weatherinprompt =
      `The weather conditions for the next seven days are as follows:\n\n` +
      weather
        .map((day) => {
          return `📅 ${day.date}
    - Weather: ${day.weather}
    - Temp: ${day.temp}°C (Min: ${day.temp_min}°C, Max: ${day.temp_max}°C)
    - Feels Like: ${day.feels_like}°C
    - Humidity: ${day.humidity}%
    - Rain Probability: ${day.rain_probability}%
    - Wind Speed: ${day.wind} km/h
    - Cloud Cover: ${day.cloud_cover}%
    `;
        })
        .join("\n");
  }

  let clothesinprompt = ``;
  if (clothes) {
    clothesinprompt =
      `You have the following clothes in your wardrobe:\n\n` + clothes;
  }
  const promptContent = `            You are now operating as the world's foremost expert on ${title}. You possess comprehensive knowledge equivalent to decades of specialized study and practical experience in this field.
      You are to suggest the clothes for the week for the user .
              Drawing on this exceptional expertise, please provide me with:
              ${input}
              ${weatherinprompt}
              ${clothesinprompt}
              Please be thorough, precise, and explain in clear terms. 
              Keep responses short, direct, and without unnecessary explanations. Provide only the necessary recommendations.`;
  console.log("final prompt", promptContent);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: promptContent }] }],
    generationConfig,
  });

  const response = result.response;
  const text = response.text();
  //   console.log('result is ', text)

  return res.json({ response: text });
});

router.get("/chathistory", authenticatemain, async (req, res) => {
  const userid = req.user.id;
  console.log("userid", userid);
  const chatHistory = await ChatMessage.find({ userId: userid }).sort({
    createdAt: -1,
  });
  res.json({ chatHistory: chatHistory });
});
import User from "../model/user.js";
router.post("/getshoppingsuggestions", authenticatemain, async (req, res) => {
  const userid = req.user.id;
  const user = await User.findById(userid);
  const preferrence = user.preferences;
  if (!user) {
    return res.json({ status: false, msg: "user not found" });
  }

  console.log("user:", user.preferences);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };
  const clothes = user.clothes;
  // console.log(clothes)
  let cloths = "";
  for (let i = 0; i < clothes.length; i++) {
    cloths += clothes[i];
  }
  let preferencebyuser = "";
  if (preferrence) {
    preferencebyuser = `The preferrnece for the user is ${preferrence}`;
  }
  let userclothes = "";
  if (cloths) {
    userclothes = `The clothes that user have are ${cloths}`;
  }
  const promptContent = `You are an expert on the clothes and the clothes are given to you and suggest some clothes that can be searched on 
  
  ecommerce websites and give the response in a list format 
  ${preferencebyuser} and ${userclothes} give me a list of the clothes you think will be a great additon and gie it like a alist in a dot formatted list and i dont need an explanation just the cloths.`;
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: promptContent }] }],
    generationConfig,
  });

  console.log(promptContent);
  const response = result.response;
  const text = response.text();
  // console.log(cloths)
  res.json({ suggestion: text }); // correct JSON
});

export default router;
