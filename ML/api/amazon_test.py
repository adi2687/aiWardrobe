from flask import Flask, request, jsonify, render_template
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import google.generativeai as genai
import os
from dotenv import load_dotenv
import time
import random   
import logging
from flask_cors import CORS

# from mynbtra import scrape_mynttr
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
logging.basicConfig(level=logging.INFO)

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
]
chrome_options.add_argument(f"user-agent={random.choice(USER_AGENTS)}")
input_prompt = """
You are an advanced AI fashion classifier. Analyze the provided image and list clothing items using only the type and color in the format: "<Clothing Type>: <Color>". Provide no additional details or accessories.
"""

@app.route('/',methods=['GET'])
def home():
    return "Home"


def scrape_amazon(query):
    logging.info(f"Scraping Amazon for query: {query}")

    # Initialize WebDriver with WebDriver Manager
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    try:
        # Construct Amazon search URL
        url = f"https://www.amazon.in/s?k={query}"
        logging.info(f"Opening URL: {url}")
        driver.get(url)

        # Wait for results to load (adjust time if needed)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".s-main-slot")))

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
        for index, product in enumerate(soup.select(".s-main-slot .s-result-item")):
            title_tag = product.select_one("h2 .a-text-normal")
            title = title_tag.text.strip() if title_tag else "N/A"

            price_tag = product.select_one(".a-price .a-offscreen")
            price = price_tag.text.strip() if price_tag else "N/A"

            img_tag = product.select_one(".s-image")
            img_url = img_tag["src"] if img_tag else "N/A"

            link_tag = product.select_one(".a-link-normal")
            product_url = f"https://www.amazon.in{link_tag['href']}" if link_tag else "N/A"

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
        logging.error(f"Error scraping Amazon: {str(e)}")
        return {"error": str(e)}

    finally:
        driver.quit()
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
            driver.quit()  
@app.route('/shop_myntra',methods=['GET'])
def myntra():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    # scrape_myntra(query)
    data=scrape_myntra(query)
    return jsonify(data)
@app.route('/classify', methods=['POST'])
def classify_images():
    files = request.files.getlist('images')
    results = []
    # print("here")
    for file in files:
        image_data = [{"mime_type": file.content_type, "data": file.read()}]
        model = genai.GenerativeModel('gemini-1.5-flash-8b')
        response = model.generate_content([input_prompt, image_data[0]])
        results.append({"filename": file.filename, "raw_response": response.text})
    return jsonify({"results": results})

@app.route('/shop', methods=['GET'])
def shop():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    data = scrape_amazon(query)
    return jsonify(data)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
