"""
Backup scraper module for AI Wardrobe application.
This module provides fallback scraping functionality when primary scrapers fail.
"""

import requests
import json
import logging
import random
import time
import os
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Mock product data for complete fallback scenario
FALLBACK_PRODUCTS = [
    {
        "name": "Classic Cotton T-Shirt",
        "price": "₹599",
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "product_url": "https://www.example.com/product/1"
    },
    {
        "name": "Slim Fit Jeans",
        "price": "₹1,299",
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "product_url": "https://www.example.com/product/2"
    },
    {
        "name": "Casual Hoodie",
        "price": "₹1,499",
        "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "product_url": "https://www.example.com/product/3"
    },
    {
        "name": "Formal Shirt",
        "price": "₹899",
        "image_url": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "product_url": "https://www.example.com/product/4"
    },
    {
        "name": "Running Shoes",
        "price": "₹2,499",
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "product_url": "https://www.example.com/product/5"
    },
    {
        "name": "Leather Jacket",
        "price": "₹3,999",
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "product_url": "https://www.example.com/product/6"
    },
    {
        "name": "Knit Sweater",
        "price": "₹1,799",
        "image_url": "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "product_url": "https://www.example.com/product/7"
    },
    {
        "name": "Denim Jacket",
        "price": "₹2,299",
        "image_url": "https://images.unsplash.com/photo-1559551409-dadc959f76b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        "product_url": "https://www.example.com/product/8"
    }
]

# Headers to mimic a browser request
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}

def backup_amazon_scrape(query):
    """
    Backup method to scrape Amazon using requests instead of Selenium.
    Falls back to mock data if the request fails.
    
    Args:
        query (str): Search query for products
        
    Returns:
        list: Product data with name, price, image_url, and product_url
    """
    try:
        logger.info(f"Using backup scraper for Amazon with query: {query}")
        
        # Format the query for URL
        formatted_query = query.replace(" ", "+")
        url = f"https://www.amazon.in/s?k={formatted_query}"
        
        # Add random delay to avoid rate limiting
        time.sleep(random.uniform(1, 3))
        
        # Make the request
        response = requests.get(url, headers=HEADERS, timeout=10)
        
        if response.status_code != 200:
            logger.warning(f"Backup Amazon scraper received status code: {response.status_code}")
            return filter_fallback_products(query)
        
        # Parse the HTML
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Extract product data
        products = []
        product_cards = soup.select(".s-result-item[data-component-type='s-search-result']")
        
        if not product_cards:
            logger.warning("No product cards found in backup Amazon scraper")
            return filter_fallback_products(query)
        
        for card in product_cards[:10]:  # Limit to 10 products
            try:
                # Extract name
                name_element = card.select_one("h2 .a-link-normal")
                if not name_element:
                    continue
                name = name_element.text.strip()
                
                # Extract price
                price_element = card.select_one(".a-price .a-offscreen")
                price = price_element.text.strip() if price_element else "Price not available"
                
                # Extract image URL
                img_element = card.select_one(".s-image")
                img_url = img_element['src'] if img_element and 'src' in img_element.attrs else ""
                
                # Extract product URL
                link_element = card.select_one("h2 .a-link-normal")
                product_url = "https://www.amazon.in" + link_element['href'] if link_element and 'href' in link_element.attrs else ""
                
                if name and img_url and product_url:
                    products.append({
                        "name": name,
                        "price": price,
                        "image_url": img_url,
                        "product_url": product_url
                    })
            except Exception as e:
                logger.error(f"Error extracting product from backup Amazon scraper: {str(e)}")
                continue
        
        if products:
            logger.info(f"Backup Amazon scraper found {len(products)} products")
            return products
        else:
            logger.warning("No products extracted from backup Amazon scraper")
            return filter_fallback_products(query)
            
    except Exception as e:
        logger.error(f"Error in backup Amazon scraper: {str(e)}")
        return filter_fallback_products(query)

def backup_myntra_scrape(query):
    """
    Backup method to scrape Myntra using requests instead of Selenium.
    Falls back to mock data if the request fails.
    
    Args:
        query (str): Search query for products
        
    Returns:
        list: Product data with name, price, image_url, and product_url
    """
    try:
        logger.info(f"Using backup scraper for Myntra with query: {query}")
        
        # Format the query for URL
        formatted_query = query.replace(" ", "-")
        url = f"https://www.myntra.com/{formatted_query}"
        
        # Add random delay to avoid rate limiting
        time.sleep(random.uniform(1, 3))
        
        # Make the request
        response = requests.get(url, headers=HEADERS, timeout=10)
        
        if response.status_code != 200:
            logger.warning(f"Backup Myntra scraper received status code: {response.status_code}")
            return filter_fallback_products(query)
        
        # Parse the HTML
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Extract product data
        products = []
        product_cards = soup.select(".product-base")
        
        if not product_cards:
            logger.warning("No product cards found in backup Myntra scraper")
            return filter_fallback_products(query)
        
        for card in product_cards[:10]:  # Limit to 10 products
            try:
                # Extract name
                brand_element = card.select_one(".product-brand")
                product_element = card.select_one(".product-product")
                
                brand = brand_element.text.strip() if brand_element else ""
                product = product_element.text.strip() if product_element else ""
                name = f"{brand} {product}".strip()
                
                if not name:
                    continue
                
                # Extract price
                price_element = card.select_one(".product-discountedPrice")
                if not price_element:
                    price_element = card.select_one(".product-price")
                price = price_element.text.strip() if price_element else "Price not available"
                
                # Extract image URL
                img_element = card.select_one("img")
                img_url = ""
                if img_element:
                    img_url = img_element.get("data-src") or img_element.get("src") or ""
                
                # Extract product URL
                link_element = card.select_one("a")
                product_url = ""
                if link_element and 'href' in link_element.attrs:
                    href = link_element['href']
                    if href.startswith("/"):
                        product_url = f"https://www.myntra.com{href}"
                    else:
                        product_url = f"https://www.myntra.com/{href}"
                
                if name and img_url and product_url:
                    products.append({
                        "name": name,
                        "price": price,
                        "image_url": img_url,
                        "product_url": product_url
                    })
            except Exception as e:
                logger.error(f"Error extracting product from backup Myntra scraper: {str(e)}")
                continue
        
        if products:
            logger.info(f"Backup Myntra scraper found {len(products)} products")
            return products
        else:
            logger.warning("No products extracted from backup Myntra scraper")
            return filter_fallback_products(query)
            
    except Exception as e:
        logger.error(f"Error in backup Myntra scraper: {str(e)}")
        return filter_fallback_products(query)

def filter_fallback_products(query):
    """
    Filter fallback products based on the query to make them more relevant.
    
    Args:
        query (str): Search query
        
    Returns:
        list: Filtered fallback products
    """
    logger.info(f"Using fallback product data for query: {query}")
    
    # Convert query to lowercase for case-insensitive matching
    query_terms = query.lower().split()
    
    # Filter products that match any term in the query
    filtered_products = []
    for product in FALLBACK_PRODUCTS:
        product_name = product["name"].lower()
        if any(term in product_name for term in query_terms):
            filtered_products.append(product)
    
    # If no matches, return a random selection of fallback products
    if not filtered_products:
        return random.sample(FALLBACK_PRODUCTS, min(5, len(FALLBACK_PRODUCTS)))
    
    return filtered_products

def get_ai_product_suggestions(preferences, wardrobe_items):
    """
    Generate AI-based product suggestions when the ML service is unavailable.
    
    Args:
        preferences (dict): User preferences
        wardrobe_items (list): User's existing wardrobe items
        
    Returns:
        list: Suggested product names
    """
    # Default suggestions if AI is unavailable
    default_suggestions = [
        "White cotton t-shirt",
        "Black slim-fit jeans",
        "Navy blue blazer",
        "Beige chinos",
        "Grey knit sweater"
    ]
    
    try:
        # Try to make the suggestions more relevant based on preferences and wardrobe
        if preferences and "style" in preferences:
            style = preferences["style"].lower()
            if "casual" in style:
                return [
                    "Graphic t-shirt",
                    "Distressed jeans",
                    "Hoodie",
                    "Sneakers",
                    "Baseball cap"
                ]
            elif "formal" in style:
                return [
                    "Dress shirt",
                    "Tailored suit",
                    "Oxford shoes",
                    "Silk tie",
                    "Cufflinks"
                ]
            elif "athletic" in style or "sports" in style:
                return [
                    "Performance t-shirt",
                    "Running shorts",
                    "Athletic socks",
                    "Training shoes",
                    "Lightweight jacket"
                ]
        
        # Check wardrobe items to avoid suggesting duplicates
        if wardrobe_items:
            existing_items = [item.lower() for item in wardrobe_items if isinstance(item, str)]
            suggestions = [s for s in default_suggestions if not any(e in s.lower() for e in existing_items)]
            
            # If we filtered out too many, add some generic ones back
            if len(suggestions) < 3:
                additional = [
                    "Patterned shirt",
                    "Leather belt",
                    "Canvas shoes",
                    "Denim jacket",
                    "Wool scarf"
                ]
                suggestions.extend(additional)
                return suggestions[:5]
            
            return suggestions
            
        return default_suggestions
        
    except Exception as e:
        logger.error(f"Error generating AI product suggestions: {str(e)}")
        return default_suggestions
