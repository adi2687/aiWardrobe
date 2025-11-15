// routes/tryon.js
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// create client helper
function createGenAI() {
  return new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATE_KEY });
}

/**
 * helper: call model with basic retry on 429 (honors retryDelay if provided)
 * - model: string
 * - contents: array as used by Google GenAI (inlineData/text parts)
 * - maxRetries: 3
 */
async function callGenerateContentWithRetry({ model, contents, maxRetries = 3 }) {
  const ai = createGenAI();
  let attempt = 0;
  let lastErr = null;

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
      });
      return response;
    } catch (err) {
      lastErr = err;
      const status = err?.status;
      // if google returns retry info, use it
      const retryInfo = err?.message && (() => {
        try {
          const parsed = JSON.parse(err.message);
          const retryDelay = parsed?.error?.details?.find(d => d["@type"]?.includes("RetryInfo"))?.retryDelay;
          return retryDelay; // string like "28s"
        } catch (e) { return null; }
      })();

      // If 429, wait then retry
      if (status === 429 && attempt < maxRetries) {
        attempt++;
        let waitMs = 2000 * attempt; // exponential backoff base
        // parse retryInfo "28s" -> ms if available
        if (retryInfo && typeof retryInfo === "string") {
          const seconds = parseInt(retryInfo.replace("s", ""), 10);
          if (!isNaN(seconds)) waitMs = seconds * 1000;
        }
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      // non-retryable or exhausted retries -> throw
      throw err;
    }
  }

  throw lastErr;
}

/* ===========================
   STEP 1: /extract
   Accepts: form-data file "image1" (model)
   Returns: clothing description text
   =========================== */
router.post("/extract", upload.single("image1"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "image1 file required (form-data key: image1)" });

    const image = req.file;
    const base64 = image.buffer.toString("base64");

    // Strong extraction prompt (structured)
    const extractionPrompt = `
You are a fashion extraction engine. Analyze the clothing in IMAGE 1 and output a COMPLETE pixel-level clothing specification.
Return ONLY plain text in this exact structured format (do not include extra commentary):

[Garment Overview]
- Name:
- Gender style:
- Category:

[Color Information]
- Base color:
- Secondary colors:
- Color gradients:
- Shadows / lighting nuances:

[Fabric Details]
- Fabric type:
- Texture description:
- Material properties (shine/matte/elasticity):
- Thickness:

[Pattern & Design]
- Pattern type:
- Pattern complexity:
- Logos/prints:
- Embroidery/stitching details:

[Shape & Fit]
- Fit (tight/regular/oversized):
- Silhouette:
- Collar:
- Sleeves:
- Hem length:

[Structural Elements]
- Buttons:
- Zippers:
- Pockets:
- Straps:
- Other details:

[Wrinkles & Shadows]
- Wrinkle locations:
- Shadow directions and intensity:

[Perspective & Deformation]
- Visible angles:
- Distortions from pose/camera:

IMPORTANT: Describe ONLY the clothing. Do NOT include any information about the person's face, identity, or body.
`;

    const contents = [
      { inlineData: { mimeType: image.mimetype || "image/jpeg", data: base64 } },
      { text: extractionPrompt }
    ];

    // Use a high-fidelity text-capable model for extraction (Pro preview recommended)
    const response = await callGenerateContentWithRetry({
      model: "models/gemini-2.5-pro-preview-03-25",
      contents
    });

    // extract text from response (support different response shapes)
    let extractedText = "";
    if (response?.parts) {
      for (const p of response.parts) if (p.text) extractedText += p.text;
    } else if (response?.candidates?.[0]?.content?.parts) {
      for (const p of response.candidates[0].content.parts) if (p.text) extractedText += p.text;
    } else if (response?.response?.candidates?.[0]?.content?.parts) {
      for (const p of response.response.candidates[0].content.parts) if (p.text) extractedText += p.text;
    }

    extractedText = extractedText.trim();
    if (!extractedText) return res.status(500).json({ error: "Extraction returned empty text", debug: response });

    return res.json({ clothingDescription: extractedText });
  } catch (err) {
    console.error("extract error:", err);
    return res.status(500).json({ error: "Extraction failed", details: err?.message || err });
  }
});

/* ===========================
   STEP 2: /apply
   Accepts: form-data file "image2" (user) and field "clothingDescription" (text from /extract)
   Returns: uploaded image url
   =========================== */
router.post("/apply", upload.single("image2"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "image2 file required (form-data key: image2)" });
    if (!req.body?.clothingDescription) return res.status(400).json({ error: "clothingDescription text required" });

    const image = req.file;
    const base64 = image.buffer.toString("base64");
    const clothingSpec = req.body.clothingDescription;

    const applyPrompt = `
Using the exact clothing specification below, recreate the SAME outfit on the person in IMAGE 2.

[CLOTHING SPECIFICATION]
${clothingSpec}

STRICT RULES:
1) Do NOT change the person's face, hair, skin tone, identity, pose, or body proportions.
2) Keep the original background unchanged.
3) Replace ONLY the clothing. Preserve fabric texture, pattern scale, color, and structural elements.
4) Adjust fit to the person's pose naturally. Maintain realistic shadows, folds, perspective.
5) No hallucinated accessories or new logos. No face or limb distortions.

Output ONLY the final image.
`;

    const contents = [
      { inlineData: { mimeType: image.mimetype || "image/jpeg", data: base64 } },
      { text: applyPrompt }
    ];

    // Use image-capable model (flash or pro-preview image). Try pro-preview first for quality.
    const response = await callGenerateContentWithRetry({
      model: "models/gemini-2.5-pro-preview-03-25",
      contents
    });

    // Extract image bytes
    const parts =
      response.parts ||
      response.candidates?.[0]?.content?.parts ||
      response.response?.candidates?.[0]?.content?.parts ||
      [];

    let generatedBase64 = null;
    for (const p of parts) {
      if (p.inlineData?.data) {
        generatedBase64 = p.inlineData.data;
        break;
      }
    }

    if (!generatedBase64) return res.status(500).json({ error: "AI did not return an image", debug: parts });

    const dataUri = `data:image/jpeg;base64,${generatedBase64}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, { folder: "tryon_images" });
    return res.json({ image: uploaded.secure_url });
  } catch (err) {
    console.error("apply error:", err);
    return res.status(500).json({ error: "Apply failed", details: err?.message || err });
  }
});

/* ===========================
   COMBINED: /transfer
   Accepts: form-data files "image1" and "image2"
   Runs extract -> apply and returns final url
   =========================== */
router.post("/transfer", upload.fields([{ name: "image1" }, { name: "image2" }]), async (req, res) => {
  try {
    if (!req.files?.image1?.[0] || !req.files?.image2?.[0]) {
      return res.status(400).json({ error: "Both image1 and image2 required" });
    }

    // Step 1: extract
    const img1 = req.files.image1[0];
    const b64img1 = img1.buffer.toString("base64");
    const extractionContents = [
      { inlineData: { mimeType: img1.mimetype || "image/jpeg", data: b64img1 } },
      { text: `
You are a fashion extraction engine. Output clothing description only in structured format:

[Garment Overview] ...
(Use the same extraction format used in /extract)
` }
    ];

    const extractResp = await callGenerateContentWithRetry({
      model: "models/gemini-2.5-pro-preview-03-25",
      contents: extractionContents
    });

    // parse extraction text
    let extractedText = "";
    if (extractResp?.parts) {
      for (const p of extractResp.parts) if (p.text) extractedText += p.text;
    } else if (extractResp?.candidates?.[0]?.content?.parts) {
      for (const p of extractResp.candidates[0].content.parts) if (p.text) extractedText += p.text;
    }
    extractedText = extractedText.trim();
    if (!extractedText) return res.status(500).json({ error: "Extraction returned empty text", debug: extractResp });

    // Step 2: apply on image2
    const img2 = req.files.image2[0];
    const b64img2 = img2.buffer.toString("base64");
    const applyPrompt = `
Using the exact clothing specification below, recreate the SAME outfit on the person in IMAGE 2.

[CLOTHING SPECIFICATION]
${extractedText}

STRICT RULES:
1) Do NOT change the person's face, hair, skin tone, identity, pose, or body proportions.
2) Keep the original background unchanged.
3) Replace ONLY the clothing. Preserve fabric texture, pattern scale, color, and structural elements.
4) Adjust fit to the person's pose naturally. Maintain realistic shadows, folds, perspective.
5) No hallucinated accessories or new logos.
Output ONLY the final image.
`;

    const applyContents = [
      { inlineData: { mimeType: img2.mimetype || "image/jpeg", data: b64img2 } },
      { text: applyPrompt }
    ];

    const applyResp = await callGenerateContentWithRetry({
      model: "models/gemini-2.5-pro-preview-03-25",
      contents: applyContents
    });

    const applyParts = applyResp.parts || applyResp.candidates?.[0]?.content?.parts || [];
    let finalBase64 = null;
    for (const p of applyParts) if (p.inlineData?.data) { finalBase64 = p.inlineData.data; break; }

    if (!finalBase64) return res.status(500).json({ error: "Apply stage returned no image", debug: applyResp });

    const dataUri = `data:image/jpeg;base64,${finalBase64}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, { folder: "tryon_images" });

    return res.json({ image: uploaded.secure_url });
  } catch (err) {
    console.error("transfer error:", err);
    return res.status(500).json({ error: "Transfer failed", details: err?.message || err });
  }
});

export default router;
