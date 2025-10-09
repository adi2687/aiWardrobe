import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function aires(prompt) {
    if (!prompt) return "";

    const prefixPrompt = `
hey man
`;


    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ type: "text", text: prompt }],
        });

        let output = response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // Remove any code fences or extra text Gemini might include
        
        return output;

    } catch (err) {
        console.error("Error calling Gemini API:", err);
        return "";
    }
}
(async () => {
    const result = await aires("hello");
    console.log(result);
})();
// export default aires;
