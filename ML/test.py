from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask_cors import CORS
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)


def get_gemini_response(input_prompt, image):
    model = genai.GenerativeModel('gemini-1.5-flash-8b')
    response = model.generate_content([input_prompt, image[0]])
    
    # Print only the raw response for debugging
    print("\n🔍 Raw Gemini Response:\n", response.text, "\n")

    return response.text

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
You are an advanced AI fashion classifier. Your task is to analyze the provided image and identify **all clothing items** present.
List each item separately using **only its category name**, without any extra text or descriptions.

Possible clothing categories:
- Jeans, Shirt, Hoodie, Sweatshirt, Saree, Jacket, Trousers, Shorts, T-shirt, Dress, Skirt, Blazer, Sweater, Kurta, Leggings,
- Tracksuit, Co-ord Set, Ethnic Wear, Jumpsuit, Dungarees/Overalls, Polo Shirt, Tunics, Cape, Shrug, Poncho, Peplum Top, Tank Top,
- Crop Top, Blouse, Bodysuit, Cardigan, Windbreaker, Parka, Trench Coat, Overcoat, Waistcoat (Vest), Kurti, Anarkali, Sharara Set,
- Lehenga, Palazzo Pants, Chinos, Cargo Pants, Sweatpants/Joggers, Culottes, Jeggings, Salwar Kameez, Gown, Kaftan, Bathrobe,
- Nightwear (Pajamas/Nightdress), Loungewear, Swimsuit, Raincoat, Ski Suit.

Your response should be **only a comma-separated list** of the detected clothing items and also you should tell the colour of the detected clothes alongside.
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

            # No parsing; only capturing the raw response
            results.append({"filename": file.filename, "raw_response": response})
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})

    return jsonify({"results": results}), 200

if __name__ == '__main__':
    app.run(debug=True,port=5001)