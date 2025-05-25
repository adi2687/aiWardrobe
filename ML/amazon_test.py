from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import random
import logging
import re
import os
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlencode, quote_plus

# Setup logging
logger = logging.getLogger(__name__)

# Configure Chrome options with optimized settings
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run headless browser (no GUI)
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument("--disable-extensions")
chrome_options.add_argument("--disable-infobars")
chrome_options.add_argument("--disable-notifications")
chrome_options.add_argument("--disable-popup-blocking")
chrome_options.add_argument("--disable-save-password-bubble")
chrome_options.add_argument("--disable-single-click-autofill")
chrome_options.add_argument("--disable-translate")
chrome_options.add_argument("--disable-web-security")
chrome_options.add_argument("--ignore-certificate-errors")
chrome_options.add_argument("--incognito")

# Expanded list of user agents for better rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
]

def scrape_amazon(query):
    """Scrape Amazon for products based on the given query.
    
    Args:
        query (str): The search query for Amazon products
        
    Returns:
        list: A list of product dictionaries with name, price, image_url, and product_url
    """
    logger.info(f"Scraping Amazon for query: {query}")
    
    # Sanitize query for URL
    safe_query = quote_plus(query)
    
    # Add random user agent to avoid detection
    chrome_options.add_argument(f"user-agent={random.choice(USER_AGENTS)}")
    
    # Initialize WebDriver with retry mechanism
    driver = None
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
            
            # Construct Amazon search URL with additional parameters for better results
            url = f"https://www.amazon.in/s?k={safe_query}&ref=nb_sb_noss&sprefix={safe_query}%2Caps%2C283"
            logger.info(f"Opening URL: {url}")
            
            # Set page load timeout
            driver.set_page_load_timeout(20)
            driver.get(url)
            
            # Wait for results to load with better error handling
            try:
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".s-main-slot"))
                )
            except TimeoutException:
                logger.warning("Timeout waiting for product grid to load, retrying...")
                retry_count += 1
                if driver:
                    driver.quit()
                continue
            
            # Add random delay to mimic human behavior
            time.sleep(random.uniform(1, 2))
            
            # Scroll to load more products dynamically with improved scrolling behavior
            last_height = driver.execute_script("return document.body.scrollHeight")
            scroll_attempts = 0
            max_scroll_attempts = 5
            
            while scroll_attempts < max_scroll_attempts:
                # Scroll down with random distance to appear more human-like
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
            
            # Extract product details with improved selectors and error handling
            products = []
            product_items = soup.select(".s-main-slot .s-result-item[data-component-type='s-search-result']")
            
            if not product_items:
                logger.warning("No product items found with primary selector, trying alternative selector")
                product_items = soup.select(".s-result-item:not(.AdHolder)")
            
            logger.info(f"Found {len(product_items)} product items in the page")
            
            for index, product in enumerate(product_items):
                try:
                    # Extract title with fallback selectors
                    title_tag = product.select_one("h2 .a-text-normal") or product.select_one(".a-text-normal")
                    title = title_tag.text.strip() if title_tag else "N/A"
                    
                    # Skip sponsored products or non-product items
                    if title == "N/A" or "sponsored" in title.lower():
                        continue
                    
                    # Extract price with multiple selector attempts
                    price = "N/A"
                    price_selectors = [
                        ".a-price .a-offscreen",
                        ".a-price",
                        ".a-color-price"
                    ]
                    
                    for selector in price_selectors:
                        price_tag = product.select_one(selector)
                        if price_tag:
                            price_text = price_tag.text.strip() if hasattr(price_tag, 'text') else ""
                            # Use regex to extract price format
                            price_match = re.search(r'₹[\d,]+\.?\d*|\$[\d,]+\.?\d*', price_text)
                            if price_match:
                                price = price_match.group(0)
                                break
                    
                    # Extract image URL with error handling
                    img_url = "N/A"
                    img_tag = product.select_one(".s-image")
                    if img_tag and img_tag.has_attr("src"):
                        img_url = img_tag["src"]
                    elif img_tag and img_tag.has_attr("data-src"):
                        img_url = img_tag["data-src"]
                    
                    # Extract product URL with proper formatting
                    product_url = "N/A"
                    link_tag = product.select_one(".a-link-normal[href]") or product.select_one("a[href]")
                    if link_tag and link_tag.has_attr("href"):
                        href = link_tag["href"]
                        if href.startswith("/"):
                            product_url = f"https://www.amazon.in{href}"
                        elif href.startswith("http"):
                            product_url = href
                    
                    # Only add products with valid data
                    if title != "N/A" and img_url != "N/A" and product_url != "N/A":
                        products.append({
                            "name": title,
                            "price": price,
                            "image_url": img_url,
                            "product_url": product_url
                        })
                        logger.info(f"Product {index + 1}: {title[:30]}... | Price: {price}")
                except Exception as item_error:
                    logger.error(f"Error extracting product {index}: {str(item_error)}")
                    continue
            
            # If we successfully scraped products, return them
            if products:
                logger.info(f"Successfully scraped {len(products)} products from Amazon")
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
            logger.error(f"Unexpected error scraping Amazon: {str(e)}", exc_info=True)
            if driver:
                driver.quit()
            return {"error": str(e)}
    
    # If we've exhausted all retries
    if retry_count >= max_retries:
        logger.error("Maximum retry attempts reached for Amazon scraping")
        return {"error": "Failed to scrape Amazon after multiple attempts"}
    
    # Fallback return in case of unexpected flow
    return {"error": "Unknown error occurred during Amazon scraping"}

# Example usage
if __name__ == '__main__':
    query = "laptop"  # Example search query
    products = scrape_amazon(query)
    print(products)
