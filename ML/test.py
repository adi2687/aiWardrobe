from flask import Flask, request, jsonify, render_template, current_app
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
import json
import hashlib
from datetime import datetime, timedelta
from functools import wraps
from flask_cors import CORS
from amazon_test import scrape_amazon
from myntra import scrape_myntra

# Load environment variables and configure Google Generative AI
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("ml_service.log")
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['CACHE_DIR'] = os.path.join(os.path.dirname(__file__), 'cache')
os.makedirs(app.config['CACHE_DIR'], exist_ok=True)

# Configure CORS - accept requests from any origin in development
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
CORS(app, resources={r"/*": {"origins": CORS_ORIGINS}}, supports_credentials=True)

# Configure Chrome options for web scraping
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_argument("--window-size=1920,1080")

# Rotating user agents to avoid detection
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0"
]

# Cache decorator for expensive operations
def cache_result(expiry_hours=24):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create a unique cache key based on function name and arguments
            cache_key = f"{func.__name__}_{hashlib.md5(str(args).encode() + str(kwargs).encode()).hexdigest()}"
            cache_file = os.path.join(current_app.config['CACHE_DIR'], f"{cache_key}.json")
            
            # Check if we have a valid cached result
            if os.path.exists(cache_file):
                try:
                    with open(cache_file, 'r') as f:
                        cached_data = json.load(f)
                    
                    # Check if cache is still valid
                    cached_time = datetime.fromisoformat(cached_data['timestamp'])
                    if cached_time > datetime.now() - timedelta(hours=expiry_hours):
                        logger.info(f"Cache hit for {func.__name__} with key {cache_key}")
                        return cached_data['data']
                except Exception as e:
                    logger.warning(f"Error reading cache: {str(e)}")
            
            # If no cache hit, execute the function
            result = func(*args, **kwargs)
            
            # Save result to cache
            try:
                with open(cache_file, 'w') as f:
                    json.dump({
                        'timestamp': datetime.now().isoformat(),
                        'data': result
                    }, f)
                logger.info(f"Cached result for {func.__name__} with key {cache_key}")
            except Exception as e:
                logger.warning(f"Error writing to cache: {str(e)}")
                
            return result
        return wrapper
    return decorator

# Error handling decorator
def handle_errors(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {str(e)}", exc_info=True)
            return jsonify({
                "error": "An unexpected error occurred",
                "message": str(e),
                "status": "error"
            }), 500
    return wrapper

# Input validation decorator
def validate_query_param(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        query = request.args.get("query")
        if not query or not query.strip():
            return jsonify({"error": "Query parameter is required", "status": "error"}), 400
        return func(*args, **kwargs)
    return wrapper

# Routes
@app.route('/')
@handle_errors
def home():
    return render_template('index.html')

@app.route('/shop_myntra', methods=['GET'])
@handle_errors
@validate_query_param
@cache_result(expiry_hours=6)  # Cache for 6 hours
def myntra_shop():
    query = request.args.get("query")
    logger.info(f"Processing Myntra search for query: {query}")
    data = scrape_myntra(query)
    
    # Validate the response data
    if isinstance(data, dict) and 'error' in data:
        return jsonify({"error": data['error'], "status": "error"}), 500
    
    # Ensure we have a valid list of products
    if not isinstance(data, list):
        logger.warning(f"Unexpected data format from Myntra scraper: {type(data)}")
        return jsonify({"error": "Invalid data format from scraper", "status": "error"}), 500
    
    return jsonify(data)

@app.route('/classify', methods=['POST'])
@handle_errors
def classify_images():
    files = request.files.getlist('images')
    if not files:
        return jsonify({"error": "No image files provided", "status": "error"}), 400
    
    results = []
    input_prompt = "Classify this clothing item and describe its style, color, and potential outfit combinations."
    
    for file in files:
        try:
            image_data = [{"mime_type": file.content_type, "data": file.read()}]
            model = genai.GenerativeModel('gemini-1.5-flash-8b')
            response = model.generate_content([input_prompt, image_data[0]])
            results.append({"filename": file.filename, "raw_response": response.text})
        except Exception as e:
            logger.error(f"Error classifying image {file.filename}: {str(e)}")
            results.append({"filename": file.filename, "error": str(e)})
    
    return jsonify({"results": results, "status": "success"})

@app.route('/shop', methods=['GET'])
@handle_errors
@validate_query_param
@cache_result(expiry_hours=6)  # Cache for 6 hours
def amazon_shop():
    query = request.args.get("query")
    logger.info(f"Processing Amazon search for query: {query}")
    data = scrape_amazon(query)
    
    # Validate the response data
    if isinstance(data, dict) and 'error' in data:
        return jsonify({"error": data['error'], "status": "error"}), 500
    
    # Ensure we have a valid list of products
    if not isinstance(data, list):
        logger.warning(f"Unexpected data format from Amazon scraper: {type(data)}")
        return jsonify({"error": "Invalid data format from scraper", "status": "error"}), 500
    
    return jsonify(data)

# New endpoint for AI-based shopping suggestions
@app.route('/shopping_suggestions', methods=['POST'])
@handle_errors
def get_shopping_suggestions():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided", "status": "error"}), 400
    
    # Extract user preferences from request
    user_preferences = data.get('preferences', {})
    wardrobe_items = data.get('wardrobe_items', [])
    
    # Prepare prompt for Gemini
    prompt = f"""Based on the following user preferences and existing wardrobe items, 
    suggest 5 clothing items they should consider buying to complement their wardrobe.
    
    User preferences: {json.dumps(user_preferences)}
    
    Existing wardrobe items: {json.dumps(wardrobe_items)}
    
    Format your response as a list of 5 specific clothing items separated by asterisks (*), 
    for example: 'Blue denim jacket*White cotton t-shirt*Black leather boots*Beige chinos*Red knit sweater'
    """
    
    try:
        # Generate suggestions using Gemini
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content(prompt)
        
        # Process response to extract suggestions
        suggestions_text = response.text.strip()
        suggestions = [item.strip() for item in suggestions_text.split('*') if item.strip()]
        
        return jsonify({
            "suggestions": suggestions,
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Error generating shopping suggestions: {str(e)}")
        return jsonify({
            "error": "Failed to generate shopping suggestions",
            "message": str(e),
            "status": "error"
        }), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("Starting ML service on port 8000")
    app.run(debug=True, port=8000, host='0.0.0.0')
