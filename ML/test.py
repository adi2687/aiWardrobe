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
from amazon_test import scrape_amazon
# from mynbtra import scrape_mynttr
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__, static_folder='static', template_folder='templates')
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


@app.route('/')
def home():
    return render_template('index.html')

from myntra import scrape_myntra
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
    app.run(debug=True, port=8000)
