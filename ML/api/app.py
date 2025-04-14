from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging
from flask_cors import CORS

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
frontendurl=os.getenv("FRONTEND_URL")
# Flask app setup
app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
logging.basicConfig(level=logging.INFO)

# Define your prompt here
input_prompt = "Classify the clothing item in this image and describe it briefly."

@app.route('/', methods=['GET'])
def home():
    return "Home"

@app.route('/classify', methods=['POST'])
def classify_images():
    print("here")
    files = request.files.getlist('images')
    results = []

    for file in files:
        image_data = [{"mime_type": file.content_type, "data": file.read()}]
        model = genai.GenerativeModel('gemini-1.5-flash-8b')
        
        try:
            response = model.generate_content([input_prompt, image_data[0]])
            results.append({
                "filename": file.filename,
                "raw_response": response.text
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
