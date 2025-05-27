from flask import Flask, request, jsonify,render_template
from flask_cors import CORS
import logging
from selenium.webdriver.chrome.options import Options

from amazon_test import scrape_amazon
from myntra import scrape_myntra

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)
# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Allowed CORS origins
CORS_ORIGINS = ['https://outfit-ai-liart.vercel.app', 'http://localhost:5173']
CORS(app, resources={r"/*": {"origins": CORS_ORIGINS}}, supports_credentials=True)

# Configure Chrome options for web scraping
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_argument("--window-size=1920,1080")

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0"
]


@app.route("/")
def main():
    return render_template("index.html")
@app.route('/shop_myntra', methods=['GET'])
def myntra_shop():
    query = request.args.get("query")
    logger.info(f"Processing Myntra search for query: {query}")
    try:
        data = scrape_myntra(query)
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error scraping Myntra: {e}")
        return jsonify({"error": "Failed to retrieve Myntra data"}), 500

@app.route('/shop', methods=['GET'])
def amazon_shop():
    query = request.args.get("query")
    logger.info(f"Processing Amazon search for query: {query}")
    try:
        data = scrape_amazon(query)
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error scraping Amazon: {e}")
        return jsonify({"error": "Failed to retrieve Amazon data"}), 500

if __name__ == '__main__':
    logger.info("Starting ML service on port 8000")
    app.run(debug=True, port=8000, host='0.0.0.0')
