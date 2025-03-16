import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import random
import logging

# Logging setup
logging.basicConfig(level=logging.INFO)

def scrape_amazon(query):
    logging.info(f"Scraping Amazon for query: {query}")

    # Configure Chrome WebDriver
    chrome_options = uc.ChromeOptions()
    chrome_options.add_argument("--headless=new")  # Run in headless mode
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--start-maximized")

    # Random user-agent
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    ]
    chrome_options.add_argument(f"user-agent={random.choice(USER_AGENTS)}")

    driver = None
    try:
        driver = uc.Chrome(options=chrome_options)

        # Construct Amazon search URL
        url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"
        logging.info(f"Opening URL: {url}")
        driver.get(url)

        # Wait for results to load
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".s-main-slot")))

        # Scroll to load more products dynamically
        last_height = driver.execute_script("return document.body.scrollHeight")
        for _ in range(3):
            driver.execute_script("window.scrollBy(0, 1000);")
            time.sleep(random.uniform(1, 2))
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height

        # Get page source and parse it
        soup = BeautifulSoup(driver.page_source, "html.parser")

        # Extract product data
        products = []
        for index, product in enumerate(soup.select("div[data-component-type='s-search-result']")):
            name_tag = product.select_one("h2 span")
            name = name_tag.text.strip() if name_tag else "N/A"

            price_tag = product.select_one("span.a-price > span.a-offscreen")
            price = price_tag.text.strip() if price_tag else "N/A"

            img_tag = product.select_one("img.s-image")
            img_url = img_tag["src"] if img_tag else "N/A"

            link_tag = product.select_one("a.a-link-normal")
            product_url = f"https://www.amazon.in{link_tag['href']}" if link_tag and link_tag.get("href") else "N/A"

            logging.info(f"Product {index + 1}: {name} | Price: {price} | Image: {img_url} | Link: {product_url}")

            products.append({
                "name": name,
                "price": price,
                "image_url": img_url,
                "product_url": product_url
            })

        logging.info(f"Scraped {len(products)} products successfully.")
        return products

    except Exception as e:
        logging.error(f"Error scraping Amazon: {str(e)}")
        return {"error": str(e)}

    finally:
        if driver:
            driver.quit()  # Close the Chrome browser
