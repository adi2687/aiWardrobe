import * as cheerio from "cheerio";
import express from "express";
import axios from "axios";

const router = express.Router();

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-IN,en;q=0.9",
  "Accept-Encoding": "gzip, deflate",
  "Sec-Ch-Ua": '"Chromium";v="131", "Not_A Brand";v="24"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

// Amazon serves a captcha / "robot check" page instead of results when it
// flags the request (common from datacenter IPs).
const looksBlocked = (html) =>
  /api-services-support@amazon|Robot Check|Enter the characters you see below|Type the characters you see in this image/i.test(
    html
  );

router.get("/", async (req, res) => {
  const clothes = (req.query.clothes || "").trim();
  console.log("Amazon Search:", clothes);

  if (!clothes) {
    return res.status(400).json({ error: "clothes is required" });
  }

  try {
    const { data, status } = await axios.get(
      `https://www.amazon.in/s?k=${encodeURIComponent(clothes)}`,
      {
        headers: BROWSER_HEADERS,
        timeout: 8000,
        responseType: "text",
        validateStatus: () => true,
      }
    );

    if (typeof data !== "string" || status >= 500 || looksBlocked(data)) {
      console.error("Amazon blocked or errored, status:", status);
      return res.json({
        success: true,
        count: 0,
        products: [],
        message:
          "Amazon didn't return results (it may be blocking automated requests). Please try again later.",
        error: "Amazon request blocked",
      });
    }

    const $ = cheerio.load(data);
    const products = [];

    $('div[data-component-type="s-search-result"]').each((_, el) => {
      const asin = $(el).attr("data-asin") || null;
      const title = $(el).find("h2 span").first().text().trim();
      const image = $(el).find("img.s-image").attr("src") || null;
      const price = $(el).find(".a-price-whole").first().text().trim() || null;
      const rating = $(el).find(".a-icon-alt").first().text().trim() || null;
      const reviews =
        $(el).find(".a-size-base.s-underline-text").first().text().trim() ||
        null;

      // Amazon no longer renders an <a> inside <h2> for every card, so the
      // old href regex always came back empty. /dp/<ASIN> always resolves.
      const href = $(el).find("h2 a, a.a-link-normal.s-no-outline").first().attr("href");
      const fromHref = href?.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/)?.[1];
      const id = asin || fromHref;
      const url = id ? `https://www.amazon.in/dp/${id}` : null;

      if (title && image) {
        products.push({ title, price, rating, reviews, image, url, asin: id });
      }
    });

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    console.error("Amazon scrape error:", err.code || err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;
