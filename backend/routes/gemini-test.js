import { OpenRouter } from "@openrouter/sdk";
import express from "express";
const openrouter = new OpenRouter({
  apiKey: "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"
});
const generate = async (req, res) => {
  const prompt = req.body.prompt;
  const result = await openrouter.chat.send({
    model: "google/gemini-3-pro-image-preview",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ], 
    max_tokens: 256,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: null,
    n: 1,
    stream: false,
    logprobs: null,
    modalities: ["image", "text"]
  });

  const message = result.choices[0].message;
  if (message.images) {
    message.images.forEach((image, index) => {
      const imageUrl = image.image_url.url;
      console.log(`Generated image ${index + 1}: ${imageUrl.substring(0, 50)}...`);
    });
  }
  res.json({message: message});
}
const router = express.Router();
router.post("/generate", generate);
export default router;