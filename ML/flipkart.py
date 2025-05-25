import requests
from bs4 import BeautifulSoup
import pandas as pd

# URL of the Flipkart search page
query = "laptops"
url = f"https://www.flipkart.com/search?q={query}"

# Headers to mimic a browser visit
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36"
}

# Send the GET request
response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

# Extract product containers
products = soup.find_all("div", class_="_1AtVbE")

# Prepare lists for storing data
titles = []
prices = []

for product in products:
    # Product Title
    title_tag = product.find("div", class_="_4rR01T")
    if title_tag:
        titles.append(title_tag.text.strip())
    
    # Product Price
    price_tag = product.find("div", class_="_30jeq3 _1_WHN1")
    if price_tag:
        prices.append(price_tag.text.strip())

# Convert to a DataFrame for easy viewing
data = pd.DataFrame({
    "Title": titles,
    "Price": prices
})

print(data)
