import express from "express";
import axios from "axios";

const router = express.Router();

// Myntra sits behind Akamai bot protection. Requests that only send a
// User-Agent are accepted at TCP/TLS level and then never answered (they hang
// until the client times out). A complete, consistent set of browser headers
// is what gets a real response.
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-IN,en;q=0.9",
  "Accept-Encoding": "gzip, deflate",
  "Cache-Control": "max-age=0",
  "Sec-Ch-Ua": '"Chromium";v="131", "Not_A Brand";v="24"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

// Vercel functions are killed at 10s on the hobby plan, so stay under that
const TIMEOUT = 8000;

const emptyResult = (res, message, error) =>
  res.json({ success: true, count: 0, products: [], message, error });

// Myntra's direct listing URLs are hyphenated slugs: "black tshirt" -> "black-tshirt"
const toSlug = (query) =>
  query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Pull the `window.__myx = {...}` object out of the page, respecting strings
// so braces inside product names/descriptions can't end the object early.
const extractMyx = (html) => {
  const marker = html.indexOf("window.__myx =");
  if (marker === -1) return null;

  const start = html.indexOf("{", marker);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  let quote = "";

  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === quote) inString = false;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      quote = c;
    } else if (c === "{") {
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0) return JSON.parse(html.slice(start, i + 1));
    }
  }
  return null;
};

const fetchPage = async (url) => {
  const response = await axios.get(url, {
    headers: BROWSER_HEADERS,
    timeout: TIMEOUT,
    maxRedirects: 3,
    responseType: "text",
    validateStatus: (status) => status < 500,
  });
  if (response.status >= 400 || typeof response.data !== "string") {
    throw Object.assign(new Error(`Myntra returned ${response.status}`), {
      status: response.status,
    });
  }
  return response.data;
};

const toHttps = (url) => (url ? url.replace(/^http:\/\//i, "https://") : null);

const mapProduct = (p) => ({
  id: p.productId || p.id || null,
  title: p.productName || p.product || p.title || "Product",
  brand: p.brand || null,
  price: p.price ?? null,
  mrp: p.mrp ?? null,
  discount: p.discountDisplayLabel || p.discount || null,
  // searchImage is already an absolute URL on assets.myntassets.com
  image: toHttps(p.searchImage || p.image || null),
  url: p.landingPageUrl
    ? `https://www.myntra.com/${p.landingPageUrl}`
    : p.url || null,
  rating: p.rating || null,
});

// Test endpoint to verify route is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Myntra route is working",
    timestamp: new Date().toISOString(),
  });
});

router.get("/", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache");

  const clothes = (req.query.clothes || "").trim();
  console.log("Myntra Search:", clothes);

  if (!clothes) {
    return res
      .status(400)
      .json({ success: false, error: "clothes parameter is required" });
  }

  const slug = toSlug(clothes);
  if (!slug) {
    return res
      .status(400)
      .json({ success: false, error: "clothes parameter is not searchable" });
  }

  const candidates = [
    `https://www.myntra.com/${slug}`,
    `https://www.myntra.com/search?q=${encodeURIComponent(clothes)}`,
  ];

  let lastError = null;

  for (const url of candidates) {
    try {
      const html = await fetchPage(url);
      const myx = extractMyx(html);
      const raw = myx?.searchData?.results?.products || myx?.results?.products;

      if (!Array.isArray(raw)) {
        lastError = new Error("Myntra data structure not found");
        continue;
      }

      const products = raw.map(mapProduct).filter((p) => p.title && p.image);
      return res.json({
        success: true,
        count: products.length,
        products,
        ...(products.length === 0 && {
          message: "No products found for this search",
        }),
      });
    } catch (err) {
      console.error(`Myntra fetch failed for ${url}:`, err.code || err.message);
      lastError = err;
    }
  }

  // Both URL formats failed. Return an empty list so the UI degrades gracefully.
  const blocked =
    lastError?.code === "ECONNABORTED" ||
    lastError?.status === 403 ||
    lastError?.status === 429;

  return emptyResult(
    res,
    blocked
      ? "Myntra didn't respond (it may be blocking automated requests). Please try again later."
      : "Couldn't read products from Myntra. Please try a different search term.",
    lastError?.message || "Myntra request failed"
  );
});

export default router;
