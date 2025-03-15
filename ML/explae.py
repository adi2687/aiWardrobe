from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask_cors import CORS  # ✅ Import CORS

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__, static_folder='static', template_folder='templates')

# ✅ Enable CORS for all routes, allow credentials

def get_gemini_response(input_prompt, image):
    model = genai.GenerativeModel('gemini-1.5-flash-8b')
    response = model.generate_content([input_prompt, image[0]])
    print("\n🔍 Raw Gemini Response:\n", response.text, "\n")
    return response.text

@app.route('/classify', methods=['POST'])
def classify_images():
    if 'images' not in request.files:
        return jsonify({"error": "No images provided"}), 400

    files = request.files.getlist('images')
    results = []

    for file in files:
        try:
            bytes_data = file.read()
            image_data = [{"mime_type": file.content_type, "data": bytes_data}]
            response = get_gemini_response("Classify this image", image_data)
            results.append({"filename": file.filename, "classification": response})
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})

    return jsonify({"results": results}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)
