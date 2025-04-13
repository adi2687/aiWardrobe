from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import random
import logging

app = Flask(__name__)


# Logging setup
logging.basicConfig(level=logging.INFO)

def scrape_myntra(query):
    logging.info(f"Scraping Myntra for query: {query}")

    # Configure Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")

    # Random user-agent to avoid detection
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    ]
    chrome_options.add_argument(f"user-agent={random.choice(USER_AGENTS)}")

    driver = None
    try:
        # Initialize WebDriver with WebDriver Manager
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

        # Construct Myntra search URL
        url = f"https://www.myntra.com/{query}?rawQuery={query}"
        logging.info(f"Opening URL: {url}")
        driver.get(url)

        # Wait until results load
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".results-base")))

        # Scroll to load more products dynamically
        last_height = driver.execute_script("return document.body.scrollHeight")
        for _ in range(5):  # Increased scroll count for better loading
            driver.execute_script("window.scrollBy(0, 1000);")
            time.sleep(random.uniform(1.5, 2.5))  # Slight delay to allow images to load
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

        # Get page source
        html_content = driver.page_source

        # Parse with BeautifulSoup
        soup = BeautifulSoup(html_content, "html.parser")

        # Extract product data
        products = []
        for index, product in enumerate(soup.select(".product-base")):
            name_tag = product.select_one(".product-product")
            name = name_tag.text.strip() if name_tag else "N/A"

            price_tag = product.select_one(".product-discountedPrice")
            price = price_tag.text.strip() if price_tag else "N/A"

            img_tag = product.select_one("img")
            img_url = "N/A"
            if img_tag:
                img_url = img_tag.get("data-src") or img_tag.get("src") or img_tag.get("srcset", "N/A")

            link_tag = product.select_one("a")
            raw_href = link_tag["href"] if link_tag and link_tag.has_attr("href") else None

            # Construct product URL correctly
            product_url = "N/A"
            if raw_href:
                if raw_href.startswith("/"):
                    raw_href = raw_href.lstrip("/")
                product_url = f"https://www.myntra.com/{raw_href}"

            logging.info(f"Product {index + 1}: {name} | Price: {price} | Image: {img_url} | URL: {product_url}")

            products.append({
                "name": name,
                "price": price,
                "image_url": img_url,
                "product_url": product_url
            })

        logging.info(f"Scraped {len(products)} products successfully.")
        return products

    except Exception as e:
        logging.error(f"Error scraping Myntra: {str(e)}")
        return {"error": str(e)}

    finally:
        if driver:
            driver.quit()  # Ensure Chrome closes properly

@app.route('/shop_myntra', methods=['GET'])
def scrape():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    data = scrape_myntra(query)
    return jsonify(data)

# if __name__ == "__main__":

#     app.run(debug=True,port=5001)