import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { clothes } = req.query;
    console.log("Search:", clothes);

    if (!clothes) {
      return res.status(400).json({ error: "clothes is required" });
    }

    const url = `https://www.myntra.com/${encodeURIComponent(clothes)}`;

    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html",
        Referer: "https://www.myntra.com/",
      },
      timeout: 10000,
    });

    // 🔐 SAFE extraction of window.__myx
    const start = html.indexOf("window.__myx =");
    if (start === -1) {
      return res.status(500).json({ error: "Myntra data not found" });
    }

    const sliced = html.slice(start);
    const jsonStart = sliced.indexOf("{");

    let braceCount = 0;
    let jsonEnd = -1;

    for (let i = jsonStart; i < sliced.length; i++) {
      if (sliced[i] === "{") braceCount++;
      if (sliced[i] === "}") braceCount--;

      if (braceCount === 0) {
        jsonEnd = i + 1;
        break;
      }
    }

    if (jsonEnd === -1) {
      return res.status(500).json({ error: "Failed to parse Myntra JSON" });
    }

    const myxData = JSON.parse(sliced.slice(jsonStart, jsonEnd));

    const productsRaw =
      myxData?.searchData?.results?.products || [];

    const products = productsRaw.map((p) => ({
      id: p.productId,
      title: p.productName,
      brand: p.brand,
      price: p.price,
      mrp: p.mrp,
      discount: p.discountDisplayLabel || null,
      image: `https://assets.myntassets.com/w_412,q_60/${p.searchImage}`,
      url: `https://www.myntra.com/${p.landingPageUrl}`,
      rating: p.rating || null,
    }));

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("Myntra scrape error:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch Myntra products",
    });
  }
});

export default router;
