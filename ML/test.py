from flask import Flask, request, jsonify, render_template, current_app
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, TimeoutException
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
import traceback
import requests
from datetime import datetime, timedelta
from functools import wraps
from flask_cors import CORS

# Import primary scrapers
from amazon_test import scrape_amazon
from myntra import scrape_myntra

# Import backup scrapers
from backup_scraper import backup_amazon_scrape, backup_myntra_scrape, get_ai_product_suggestions

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
    
    try:
        # Try the primary scraper first
        data = scrape_myntra(query)
        
        # Validate the response data
        if isinstance(data, dict) and 'error' in data:
            logger.warning(f"Primary Myntra scraper returned error: {data['error']}")
            logger.info("Falling back to backup Myntra scraper")
            data = backup_myntra_scrape(query)
        
        # Ensure we have a valid list of products
        if not isinstance(data, list):
            logger.warning(f"Unexpected data format from Myntra scraper: {type(data)}")
            logger.info("Falling back to backup Myntra scraper")
            data = backup_myntra_scrape(query)
            
        # If we still don't have valid data, return an error
        if not isinstance(data, list) or len(data) == 0:
            logger.error("Both primary and backup Myntra scrapers failed to return valid data")
            return jsonify({
                "error": "Failed to retrieve product data", 
                "status": "error",
                "message": "Our systems are currently experiencing difficulties. Please try again later."
            }), 500
        
        return jsonify(data)
        
    except (WebDriverException, TimeoutException) as e:
        # Handle Selenium-specific exceptions
        logger.error(f"Selenium error in Myntra scraper: {str(e)}")
        logger.info("Falling back to backup Myntra scraper due to Selenium error")
        
        try:
            # Try the backup scraper
            data = backup_myntra_scrape(query)
            return jsonify(data)
        except Exception as backup_error:
            logger.error(f"Backup Myntra scraper also failed: {str(backup_error)}")
            return jsonify({
                "error": "Failed to retrieve product data", 
                "status": "error",
                "message": "Our systems are currently experiencing difficulties. Please try again later."
            }), 500
    
    except Exception as e:
        # Handle any other exceptions
        logger.error(f"Unexpected error in Myntra scraper: {str(e)}")
        logger.error(traceback.format_exc())
        logger.info("Falling back to backup Myntra scraper due to unexpected error")
        
        try:
            # Try the backup scraper
            data = backup_myntra_scrape(query)
            return jsonify(data)
        except Exception as backup_error:
            logger.error(f"Backup Myntra scraper also failed: {str(backup_error)}")
            return jsonify({
                "error": "Failed to retrieve product data", 
                "status": "error",
                "message": "Our systems are currently experiencing difficulties. Please try again later."
            }), 500

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
    
    try:
        # Try the primary scraper first
        data = scrape_amazon(query)
        
        # Validate the response data
        if isinstance(data, dict) and 'error' in data:
            logger.warning(f"Primary Amazon scraper returned error: {data['error']}")
            logger.info("Falling back to backup Amazon scraper")
            data = backup_amazon_scrape(query)
        
        # Ensure we have a valid list of products
        if not isinstance(data, list):
            logger.warning(f"Unexpected data format from Amazon scraper: {type(data)}")
            logger.info("Falling back to backup Amazon scraper")
            data = backup_amazon_scrape(query)
            
        # If we still don't have valid data, return an error
        if not isinstance(data, list) or len(data) == 0:
            logger.error("Both primary and backup Amazon scrapers failed to return valid data")
            return jsonify({
                "error": "Failed to retrieve product data", 
                "status": "error",
                "message": "Our systems are currently experiencing difficulties. Please try again later."
            }), 500
        
        return jsonify(data)
        
    except (WebDriverException, TimeoutException) as e:
        # Handle Selenium-specific exceptions
        logger.error(f"Selenium error in Amazon scraper: {str(e)}")
        logger.info("Falling back to backup Amazon scraper due to Selenium error")
        
        try:
            # Try the backup scraper
            data = backup_amazon_scrape(query)
            return jsonify(data)
        except Exception as backup_error:
            logger.error(f"Backup Amazon scraper also failed: {str(backup_error)}")
            return jsonify({
                "error": "Failed to retrieve product data", 
                "status": "error",
                "message": "Our systems are currently experiencing difficulties. Please try again later."
            }), 500
    
    except Exception as e:
        # Handle any other exceptions
        logger.error(f"Unexpected error in Amazon scraper: {str(e)}")
        logger.error(traceback.format_exc())
        logger.info("Falling back to backup Amazon scraper due to unexpected error")
        
        try:
            # Try the backup scraper
            data = backup_amazon_scrape(query)
            return jsonify(data)
        except Exception as backup_error:
            logger.error(f"Backup Amazon scraper also failed: {str(backup_error)}")
            return jsonify({
                "error": "Failed to retrieve product data", 
                "status": "error",
                "message": "Our systems are currently experiencing difficulties. Please try again later."
            }), 500

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
        
        # Validate suggestions
        if not suggestions or len(suggestions) < 3:
            logger.warning("Gemini API returned insufficient suggestions, using backup")
            raise ValueError("Insufficient suggestions from AI model")
        
        return jsonify({
            "suggestions": suggestions,
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Error generating shopping suggestions: {str(e)}")
        logger.info("Falling back to backup AI suggestions")
        
        try:
            # Use our backup suggestion generator
            backup_suggestions = get_ai_product_suggestions(user_preferences, wardrobe_items)
            
            return jsonify({
                "suggestions": backup_suggestions,
                "status": "success",
                "source": "backup"
            })
        except Exception as backup_error:
            logger.error(f"Backup suggestion generator also failed: {str(backup_error)}")
            return jsonify({
                "error": "Failed to generate shopping suggestions",
                "message": "Our AI recommendation system is currently unavailable. Please try again later.",
                "status": "error"
            }), 500

# Health check endpoint with detailed service status
@app.route('/health', methods=['GET'])
def health_check():
    health_status = {
        "status": "healthy",
        "version": "1.0.1",  # Updated version with backup functionality
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    # Check Google API connectivity
    try:
        # Simple test of Gemini API
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello")
        if response and hasattr(response, 'text'):
            health_status["services"]["gemini_api"] = {
                "status": "available",
                "last_checked": datetime.now().isoformat()
            }
        else:
            health_status["services"]["gemini_api"] = {
                "status": "degraded",
                "last_checked": datetime.now().isoformat(),
                "message": "API returned unexpected response format"
            }
    except Exception as e:
        health_status["services"]["gemini_api"] = {
            "status": "unavailable",
            "last_checked": datetime.now().isoformat(),
            "error": str(e)
        }
        # If Gemini API is down, overall status is degraded
        health_status["status"] = "degraded"
    
    # Check if we can access Amazon (just the website, not scraping)
    try:
        response = requests.get("https://www.amazon.in", 
                              headers={"User-Agent": random.choice(USER_AGENTS)},
                              timeout=5)
        if response.status_code == 200:
            health_status["services"]["amazon_access"] = {
                "status": "available",
                "last_checked": datetime.now().isoformat()
            }
        else:
            health_status["services"]["amazon_access"] = {
                "status": "degraded",
                "last_checked": datetime.now().isoformat(),
                "status_code": response.status_code
            }
    except Exception as e:
        health_status["services"]["amazon_access"] = {
            "status": "unavailable",
            "last_checked": datetime.now().isoformat(),
            "error": str(e)
        }
    
    # Check if we can access Myntra (just the website, not scraping)
    try:
        response = requests.get("https://www.myntra.com", 
                              headers={"User-Agent": random.choice(USER_AGENTS)},
                              timeout=5)
        if response.status_code == 200:
            health_status["services"]["myntra_access"] = {
                "status": "available",
                "last_checked": datetime.now().isoformat()
            }
        else:
            health_status["services"]["myntra_access"] = {
                "status": "degraded",
                "last_checked": datetime.now().isoformat(),
                "status_code": response.status_code
            }
    except Exception as e:
        health_status["services"]["myntra_access"] = {
            "status": "unavailable",
            "last_checked": datetime.now().isoformat(),
            "error": str(e)
        }
    
    # Check if cache directory is accessible and working
    try:
        cache_test_file = os.path.join(app.config['CACHE_DIR'], 'health_check_test.txt')
        with open(cache_test_file, 'w') as f:
            f.write(f"Health check at {datetime.now().isoformat()}")
        os.remove(cache_test_file)
        health_status["services"]["cache_system"] = {
            "status": "available",
            "last_checked": datetime.now().isoformat()
        }
    except Exception as e:
        health_status["services"]["cache_system"] = {
            "status": "unavailable",
            "last_checked": datetime.now().isoformat(),
            "error": str(e)
        }
        # If cache system is down, overall status is degraded
        health_status["status"] = "degraded"
    
    # If any critical service is unavailable, mark the overall status as degraded
    if any(service["status"] == "unavailable" for service in health_status["services"].values()):
        health_status["status"] = "degraded"
    
    return jsonify(health_status)

if __name__ == '__main__':
    logger.info("Starting ML service on port 8000")
    app.run(debug=True, port=8000, host='0.0.0.0')
