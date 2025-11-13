import axios from "axios";
import * as cheerio from "cheerio";

const url = "https://www.amazon.in/s?k=bags&crid=1LVGKF1T0O2E4&sprefix=ba%2Caps%2C211&ref=nb_sb_noss_2";

async function scrapeAmazon() {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const $ = cheerio.load(data);
    
    const items = [];

    $("div.s-main-slot div[data-component-type='s-search-result']").each((_, el) => {
      const title = $(el).find("h2 a span").text().trim();
      const price = $(el).find(".a-price-whole").text().trim();
      const image = $(el).find("img.s-image").attr("src");
      if (title && image) items.push({ title, price, image });
    });

    console.log(items.slice(0, 5)); // show top 5
  } catch (err) {
    console.error("Scraping failed:", err.message);
  }
}

scrapeAmazon();
