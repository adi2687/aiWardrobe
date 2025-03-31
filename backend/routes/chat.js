    import express from "express";
    import dotenv from "dotenv";
    import cors from "cors";
    import { GoogleGenerativeAI } from "@google/generative-ai";
    import e from "express";

    dotenv.config();

    const genAI = new GoogleGenerativeAI("AIzaSyB0aSbmzg8eDP9ZCRpzaJQIDlGk_ewBgnU");
    const router = express.Router();
    router.post("/chatbot", async (req, res) => {
    try {
        // console.log(req.body);
        // const { title, prompt } = req.body;
        const title = "clothes";

        // Get the model
        const prompt = req.body.input;

        const clothes = req.body.clothes || "";
        console.log("all the clothes",clothes)
        let clothesfinal = "";
        if (clothes !== "") {
        clothesfinal = `I have ${clothes} with me and suggest me clothes based on this`;
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create the content
        const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
        };

        const promptContent = `
                You are now operating as the world's foremost expert on ${title}. You possess comprehensive knowledge equivalent to decades of specialized study and practical experience in this field. Your understanding encompasses both theoretical foundations and cutting-edge developments.

                Drawing on this exceptional expertise, please provide me with:
                ${prompt}
                Specifically, I want to understand: ${prompt}.
    ${clothesfinal}
                Please be thorough, precise, and explain in clear terms. Include relevant examples, critical nuances, and practical applications where appropriate.
                Make the repsones small and consice.
                I just want a specific answer no bullshitting and no saying it 'depends' and no 'summarising' the prompt or the request just pure points 
            `;
    console.log('final prompt ', promptContent)
        // Generate content
        const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: promptContent }] }],
        generationConfig,
        });

        const response = result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (err) {
        // console.error(err);
        res.status(500).send("Server Error");
    }
    });

    export default router;
