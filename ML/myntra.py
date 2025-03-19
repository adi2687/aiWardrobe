from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import csv

# Setup ChromeDriver
service = Service(ChromeDriverManager().install())
options = webdriver.ChromeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_argument("--window-size=1920,1080")
options.add_argument("--disable-gpu")  # Prevent GPU-related errors
options.add_argument("--headless")

# Launch browser
driver = webdriver.Chrome(service=service, options=options)

try:
    url = "https://www.myntra.com/men-tshirts"
    driver.get(url)

    # Wait for products to load
    wait = WebDriverWait(driver, 15)
    wait.until(EC.presence_of_element_located((By.XPATH, '//li[@class="product-base"]')))

    # Extract product details
    products = driver.find_elements(By.XPATH, '//li[@class="product-base"]')

    extracted_data = []
    for product in products[:10]:  # Get first 10 products
        brand = product.find_element(By.XPATH, './/h3[@class="product-brand"]').text
        name = product.find_element(By.XPATH, './/h4[@class="product-product"]').text
        try:
            price = product.find_element(By.XPATH, './/span[@class="product-discountedPrice"]').text
        except:
            price = "No Discounted Price"

        extracted_data.append([brand, name, price])
        print(f"Brand: {brand} | Product: {name} | Price: {price}")

    # Save data to CSV
    with open("myntra_products.csv", "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["Brand", "Product", "Price"])
        writer.writerows(extracted_data)

    print("\n✅ Data saved to 'myntra_products.csv'")

    # Keep the browser open
    input("\nPress Enter to close the browser...")

finally:
    driver.quit()  # Ensure browser closes
