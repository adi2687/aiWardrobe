import * as cheerio from "cheerio";
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // const { clothes } = req.body ? req.body : req.url;
    const clothes = req.url?.split("?")[1].split("=")[1]
    console.log(clothes);
    if (!clothes) {
      return res.status(400).json({ error: "clothes is required" });
    }

    const url = `https://www.amazon.in/s?k=${encodeURIComponent(clothes)}`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept-Language": "en-IN,en;q=0.9",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const products = [];

    // ✅ Single loop over product cards
    $('div[data-component-type="s-search-result"]').each((_, el) => {
      const title = $(el).find("h2 span").text().trim();
      const image = $(el).find("img.s-image").attr("src") || null;

      const price = $(el).find(".a-price-whole").first().text() || null;
      const rating = $(el).find(".a-icon-alt").first().text() || null;
      const reviews =
        $(el).find(".a-size-base.s-underline-text").first().text() || null;

      const asin = $(el).attr("data-asin");

      // ✅ Clean product link
      const rawLink = $(el).find("h2 a").attr("href");
      const cleanPath =
        rawLink?.match(/\/(dp|gp\/product)\/[A-Z0-9]{10}/)?.[0];

      const productUrl = cleanPath
        ? `https://www.amazon.in${cleanPath}`
        : null;

      // ✅ Minimal required fields
      if (title && image) {
        products.push({
          title,
          price,
          rating,
          reviews,
          image,
          url: productUrl,
          asin,
        });
      }
    });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("Amazon scrape error:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;
