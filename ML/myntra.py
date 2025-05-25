from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
from bs4 import BeautifulSoup
import time
import random
import logging
import re
import os
from urllib.parse import urlencode, quote_plus

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logger = logging.getLogger(__name__)
if not logger.handlers:
    logger.setLevel(logging.INFO)
    # Create handlers
    console_handler = logging.StreamHandler()
    file_handler = logging.FileHandler('myntra_scraper.log')
    
    # Create formatters
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

def scrape_myntra(query):
    """Scrape Myntra for products based on the given query.
    
    Args:
        query (str): The search query for Myntra products
        
    Returns:
        list: A list of product dictionaries with name, price, image_url, and product_url
    """
    logger.info(f"Scraping Myntra for query: {query}")
    
    # Sanitize query for URL
    safe_query = quote_plus(query)
    
    # Configure Chrome options with optimized settings
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--incognito")
    
    # Expanded list of user agents for better rotation
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    ]
    chrome_options.add_argument(f"user-agent={random.choice(USER_AGENTS)}")
    
    # Initialize WebDriver with retry mechanism
    driver = None
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Initialize WebDriver with WebDriver Manager
            driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
            
            # Set page load timeout
            driver.set_page_load_timeout(20)
            
            # Construct Myntra search URL with improved parameters
            url = f"https://www.myntra.com/{safe_query}?rawQuery={safe_query}&sort=popularity"
            logger.info(f"Opening URL: {url}")
            driver.get(url)
            
            # Wait until results load with better error handling
            try:
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".results-base"))
                )
            except TimeoutException:
                logger.warning("Timeout waiting for product grid to load, retrying...")
                retry_count += 1
                if driver:
                    driver.quit()
                continue
            
            # Add random delay to mimic human behavior
            time.sleep(random.uniform(1, 2))
            
            # Improved scrolling with random pauses to appear more human-like
            last_height = driver.execute_script("return document.body.scrollHeight")
            scroll_attempts = 0
            max_scroll_attempts = 5
            
            while scroll_attempts < max_scroll_attempts:
                # Scroll down with random distance
                scroll_amount = random.randint(800, 1200)
                driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
                
                # Random delay between scrolls
                time.sleep(random.uniform(0.5, 1.5))
                
                # Check if we've reached the bottom
                new_height = driver.execute_script("return document.body.scrollHeight")
                if new_height == last_height:
                    # Try one more scroll with larger distance
                    driver.execute_script("window.scrollBy(0, 2000);")
                    time.sleep(random.uniform(1, 2))
                    new_height = driver.execute_script("return document.body.scrollHeight")
                    if new_height == last_height:
                        break
                
                last_height = new_height
                scroll_attempts += 1
            
            # Get page source and parse with BeautifulSoup
            html_content = driver.page_source
            soup = BeautifulSoup(html_content, "html.parser")
            
            # Extract product data with improved selectors and error handling
            products = []
            product_items = soup.select(".product-base")
            
            if not product_items:
                logger.warning("No product items found with primary selector, trying alternative selector")
                product_items = soup.select(".product-grid .product-base") or soup.select(".results-base .product-grid-element")
            
            logger.info(f"Found {len(product_items)} product items in the page")
            
            for index, product in enumerate(product_items):
                try:
                    # Extract name with fallback selectors
                    name_tag = product.select_one(".product-product") or product.select_one(".product-brand")
                    name = name_tag.text.strip() if name_tag else "N/A"
                    
                    # Skip products with invalid names
                    if name == "N/A":
                        continue
                    
                    # Extract price with multiple selector attempts
                    price = "N/A"
                    price_selectors = [
                        ".product-discountedPrice",
                        ".product-price",
                        ".product-discountedPrice span",
                        ".product-price span"
                    ]
                    
                    for selector in price_selectors:
                        price_tag = product.select_one(selector)
                        if price_tag:
                            price_text = price_tag.text.strip() if hasattr(price_tag, 'text') else ""
                            # Use regex to extract price format
                            price_match = re.search(r'Rs\.\s*[\d,]+|₹\s*[\d,]+', price_text)
                            if price_match:
                                price = price_match.group(0)
                                break
                    
                    # Extract image URL with error handling
                    img_url = "N/A"
                    img_tag = product.select_one("img")
                    if img_tag:
                        # Try different image attributes in order of preference
                        img_url = (img_tag.get("data-src") or 
                                  img_tag.get("src") or 
                                  img_tag.get("data-srcset") or 
                                  img_tag.get("srcset", "N/A"))
                        
                        # If srcset contains multiple URLs, extract the first one
                        if img_url and " " in img_url:
                            img_url = img_url.split(" ")[0]
                    
                    # Extract product URL with proper formatting
                    product_url = "N/A"
                    link_tag = product.select_one("a[href]")
                    if link_tag and link_tag.has_attr("href"):
                        raw_href = link_tag["href"]
                        if raw_href:
                            if raw_href.startswith("/"):
                                raw_href = raw_href.lstrip("/")
                            product_url = f"https://www.myntra.com/{raw_href}"
                    
                    # Only add products with valid data
                    if name != "N/A" and img_url != "N/A" and product_url != "N/A":
                        products.append({
                            "name": name,
                            "price": price,
                            "image_url": img_url,
                            "product_url": product_url
                        })
                        logger.info(f"Product {index + 1}: {name[:30]}... | Price: {price}")
                except Exception as item_error:
                    logger.error(f"Error extracting product {index}: {str(item_error)}")
                    continue
            
            # If we successfully scraped products, return them
            if products:
                logger.info(f"Successfully scraped {len(products)} products from Myntra")
                return products
            
            # If no products were found, retry
            logger.warning("No products extracted, retrying...")
            retry_count += 1
            if driver:
                driver.quit()
            
        except WebDriverException as e:
            logger.error(f"WebDriver error: {str(e)}")
            retry_count += 1
            if driver:
                driver.quit()
            time.sleep(2)  # Wait before retrying
            
        except Exception as e:
            logger.error(f"Unexpected error scraping Myntra: {str(e)}", exc_info=True)
            if driver:
                driver.quit()
            return {"error": str(e)}
    
    # If we've exhausted all retries
    if retry_count >= max_retries:
        logger.error("Maximum retry attempts reached for Myntra scraping")
        return {"error": "Failed to scrape Myntra after multiple attempts"}
    
    # Fallback return in case of unexpected flow
    return {"error": "Unknown error occurred during Myntra scraping"}

@app.route('/shop_myntra', methods=['GET'])
def scrape():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    data = scrape_myntra(query)
    return jsonify(data)

# if __name__ == "__main__":

#     app.run(debug=True,port=5001)