from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import random
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

# Configure Chrome options
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run headless browser (no GUI)
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

def scrape_myntra(query):
    logging.info(f"Scraping Myntra for query: {query}")

    # Initialize WebDriver with WebDriver Manager
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    try:
        # Construct Myntra search URL
        url = f"https://www.myntra.com/search/{query}"
        logging.info(f"Opening URL: {url}")
        driver.get(url)

        # Wait for results to load (adjust time if needed)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".results-base")))

        # Scroll to load more products dynamically
        last_height = driver.execute_script("return document.body.scrollHeight")
        for _ in range(3):  # Scroll 3 times to load more products
            driver.execute_script("window.scrollBy(0, 1000);")
            time.sleep(random.uniform(2, 3))  # Slight delay to allow images to load
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

        # Get page source and parse with BeautifulSoup
        html_content = driver.page_source
        soup = BeautifulSoup(html_content, "html.parser")

        # Extract product details (title, price, image, link)
        products = []
        for index, product in enumerate(soup.select(".product-base")):
            title_tag = product.select_one(".product-product")
            title = title_tag.text.strip() if title_tag else "N/A"

            price_tag = product.select_one(".product-discountedPrice")
            price = price_tag.text.strip() if price_tag else "N/A"

            img_tag = product.select_one("img")
            img_url = img_tag["data-src"] if img_tag else "N/A"

            link_tag = product.select_one("a")
            product_url = f"https://www.myntra.com{link_tag['href']}" if link_tag else "N/A"

            # Logging product info
            logging.info(f"Product {index + 1}: {title} | Price: {price} | Image: {img_url} | URL: {product_url}")

            # Append to products list
            products.append({
                "name": title,
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
        driver.quit()  # Ensure the driver is closed properly

# Example usage
if __name__ == '__main__':
    query = "shirt"  # Example search query
    products = scrape_myntra(query)
    print(products)
