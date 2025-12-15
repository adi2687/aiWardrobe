import express from "express";
import axios from "axios";

const router = express.Router();

// Test endpoint to verify route is working
router.get("/test", (req, res) => {
  res.json({ 
    success: true,
    message: "Myntra route is working",
    timestamp: new Date().toISOString()
  });
});

router.get("/", async (req, res) => {
  try {
    const { clothes } = req.query;
    console.log("Myntra Search:", clothes);

    if (!clothes) {
      return res.status(400).json({ 
        success: false,
        error: "clothes parameter is required" 
      });
    }

    // Construct proper Myntra search URL
    // Myntra uses format: https://www.myntra.com/search?q=query
    const searchQuery = encodeURIComponent(clothes);
    // Try both formats: direct path and search query
    const url = `https://www.myntra.com/${searchQuery}`;
    const searchUrl = `https://www.myntra.com/search?q=${searchQuery}`;

    console.log("Fetching from URL:", url);
    console.log("Alternative URL:", searchUrl);

    let html;
    let usedUrl = url;
    
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-IN,en;q=0.9",
          Referer: "https://www.myntra.com/",
          "Accept-Encoding": "gzip, deflate, br",
        },
        timeout: 15000,
        validateStatus: function (status) {
          return status < 500; // Don't throw for 4xx errors
        },
      });
      
      html = response.data;
      
      // If we got a redirect or error, try the search URL format
      if (response.status >= 400 || !html || html.length < 1000) {
        console.log("First URL failed, trying search URL format...");
        const searchResponse = await axios.get(searchUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-IN,en;q=0.9",
            Referer: "https://www.myntra.com/",
          },
          timeout: 15000,
        });
        html = searchResponse.data;
        usedUrl = searchUrl;
      }
    } catch (firstError) {
      // If first URL fails, try search URL format
      console.log("First URL failed, trying search URL format...", firstError.message);
      try {
        const searchResponse = await axios.get(searchUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-IN,en;q=0.9",
            Referer: "https://www.myntra.com/",
          },
          timeout: 15000,
        });
        html = searchResponse.data;
        usedUrl = searchUrl;
      } catch (secondError) {
        throw new Error(`Failed to fetch from both URL formats: ${firstError.message}, ${secondError.message}`);
      }
    }

    // Check if we got a valid HTML response
    if (!html || typeof html !== 'string') {
      console.error("Invalid HTML response from Myntra");
      return res.status(500).json({ 
        success: false,
        error: "Invalid response from Myntra",
        message: "Myntra returned an invalid response. Please try again later."
      });
    }

    if (html.length < 1000) {
      console.error("Response too short, might be an error page");
      return res.status(500).json({ 
        success: false,
        error: "Invalid response from Myntra",
        message: "Myntra returned an unexpected response. The page might be blocked or changed."
      });
    }

    // 🔐 SAFE extraction of window.__myx
    let start = html.indexOf("window.__myx =");
    let dataKey = "window.__myx";
    
    if (start === -1) {
      console.log("window.__myx not found, trying alternative data structures...");
      // Try alternative data structure
      start = html.indexOf("window.__INITIAL_STATE__");
      if (start !== -1) {
        dataKey = "window.__INITIAL_STATE__";
      } else {
        start = html.indexOf("window.__PRELOADED_STATE__");
        if (start !== -1) {
          dataKey = "window.__PRELOADED_STATE__";
        } else {
          start = html.indexOf("__myx");
          if (start !== -1) {
            dataKey = "__myx";
          }
        }
      }
    }
    
    if (start === -1) {
      console.error("No Myntra data structure found in response");
      console.log("Response preview:", html.substring(0, 500));
      return res.status(500).json({ 
        success: false,
        error: "Myntra data structure not found",
        message: "Myntra page structure may have changed. Please try a different search term or check if Myntra is accessible."
      });
    }

    const sliced = html.slice(start);
    const jsonStart = sliced.indexOf("{");

    if (jsonStart === -1) {
      return res.status(500).json({ 
        success: false,
        error: "Failed to locate JSON data",
        message: "Could not parse Myntra data structure"
      });
    }

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
      return res.status(500).json({ 
        success: false,
        error: "Failed to parse Myntra JSON",
        message: "Could not extract complete JSON data from Myntra"
      });
    }

    let myxData;
    try {
      const jsonString = sliced.slice(jsonStart, jsonEnd);
      myxData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError.message);
      return res.status(500).json({ 
        success: false,
        error: "Failed to parse Myntra JSON",
        message: "Invalid JSON structure from Myntra",
        details: parseError.message
      });
    }

    const productsRaw =
      myxData?.searchData?.results?.products || 
      myxData?.results?.products ||
      [];

    if (productsRaw.length === 0) {
      return res.json({
        success: true,
        count: 0,
        products: [],
        message: "No products found for this search"
      });
    }

    const products = productsRaw.map((p) => ({
      id: p.productId || p.id || null,
      title: p.productName || p.title || "Product",
      brand: p.brand || null,
      price: p.price || null,
      mrp: p.mrp || null,
      discount: p.discountDisplayLabel || p.discount || null,
      image: p.searchImage 
        ? `https://assets.myntassets.com/w_412,q_60/${p.searchImage}`
        : p.image || null,
      url: p.landingPageUrl 
        ? `https://www.myntra.com/${p.landingPageUrl}`
        : p.url || null,
      rating: p.rating || null,
    })).filter(p => p.title && p.image); // Filter out invalid products

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("=== MYNTRA SCRAPE ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error stack:", err.stack);
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data?.substring(0, 200));
    }
    console.error("===========================");
    
    // Provide more specific error messages
    let errorMessage = "Failed to fetch Myntra products";
    let errorDetails = {};
    
    if (err.code === 'ECONNABORTED') {
      errorMessage = "Request timeout. Myntra took too long to respond.";
    } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      errorMessage = "Cannot connect to Myntra. Please check your internet connection.";
    } else if (err.response) {
      errorMessage = `Myntra returned error: ${err.response.status} ${err.response.statusText}`;
      errorDetails.status = err.response.status;
    } else if (err.message) {
      errorMessage = `Error: ${err.message}`;
      errorDetails.message = err.message;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      message: "Please try again later or use a different search term.",
      ...(process.env.NODE_ENV === 'development' && { 
        details: errorDetails,
        stack: err.stack?.split('\n').slice(0, 5)
      })
    });
  }
});

export default router;
