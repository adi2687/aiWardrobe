from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__, static_folder='static', template_folder='templates')

def get_gemini_response(input_prompt, image):
    model = genai.GenerativeModel('gemini-1.5-flash-8b')
    response = model.generate_content([input_prompt, image[0]])
    return response.text.strip()

def input_image_setup(uploaded_file):
    if uploaded_file:
        bytes_data = uploaded_file.read()
        image_parts = [
            {
                "mime_type": uploaded_file.content_type,
                "data": bytes_data
            }
        ]
        return image_parts
    else:
        raise FileNotFoundError("No File Uploaded")

# Fashion classification prompt
input_prompt = """
You are an advanced AI fashion classifier. Your task is to accurately identify the category of clothing in the provided image. 
Analyze the image carefully and classify it into one of the following article types:

- Jeans
- Shirt
- Hoodie
- Sweatshirt
- Saree
- Jacket
- Trousers
- Shorts
- T-shirt
- Dress
- Skirt
- Blazer
- Sweater
- Kurta
- Leggings
- Tracksuit
- Co-ord Set
- Ethnic Wear
- Jumpsuit
- Dungarees/Overalls
- Polo Shirt
- Tunics
- Cape
- Shrug
- Poncho
- Peplum Top
- Tank Top
- Crop Top
- Blouse
- Bodysuit
- Cardigan
- Windbreaker
- Parka
- Trench Coat
- Overcoat
- Waistcoat (Vest)
- Kurti
- Anarkali
- Sharara Set
- Lehenga
- Palazzo Pants
- Chinos
- Cargo Pants
- Sweatpants/Joggers
- Culottes
- Jeggings
- Salwar Kameez
- Gown
- Kaftan
- Bathrobe
- Nightwear (Pajamas/Nightdress)
- Loungewear
- Swimsuit
- Raincoat
- Ski Suit

Your response should contain **only one word or phrase** representing the most accurate article type for the given image. No extra text or explanation—just the classification in one word.

"""

@app.route('/')
def home():
    return render_template('index1.html')

@app.route('/classify', methods=['POST'])
def classify_images():
    if 'images' not in request.files:
        return jsonify({"error": "No images provided"}), 400

    files = request.files.getlist('images')
    results = []

    for file in files:
        try:
            image_data = input_image_setup(file)
            response = get_gemini_response(input_prompt, image_data)
            results.append({"filename": file.filename, "classification": response})
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})

    return jsonify({"results": results}), 200

if __name__ == '__main__':
    app.run(debug=True)