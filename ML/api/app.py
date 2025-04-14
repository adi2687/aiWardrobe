from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging
from flask_cors import CORS

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
frontendurl = os.getenv("FRONTEND_URL")

# Flask app setup
app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": frontendurl}}, supports_credentials=True)
logging.basicConfig(level=logging.INFO)

# Updated prompt
input_prompt = (
    "List all the clothing items visible in this image. "
    "Format each item as:\nItem: Color\n"
    "Only list items. Do not describe the background or image style."
)

# Load Gemini model once
model = genai.GenerativeModel('gemini-1.5-flash-8b')

@app.route('/', methods=['GET'])
def home():
    return "Home"

@app.route('/classify', methods=['POST'])
@app.route('/classify', methods=['POST'])
def classify_images():
    files = request.files.getlist('images')
    results = []

    for file in files:
        image_bytes = file.read()
        image_data = [{"mime_type": file.content_type, "data": image_bytes}]

        try:
            response = model.generate_content(
                [input_prompt, image_data[0]],
                generation_config={
                    "temperature": 0.2,
                    "top_p": 1,
                    "top_k": 1,
                    "max_output_tokens": 256
                }
            )

            structured_items = parse_clothing_list(response.text)

            results.append({
                "filename": file.filename,
                "clothing_items": structured_items
            })

        except Exception as e:
            logging.error(f"Error processing {file.filename}: {e}")
            results.append({
                "filename": file.filename,
                "error": str(e)
            })

    return jsonify({"results": results})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
