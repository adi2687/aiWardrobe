from flask import Flask, request, jsonify, render_template
import os
import numpy as np
import pickle
import faiss
import tensorflow as tf
import pandas as pd
from PIL import Image
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import GlobalMaxPooling2D
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from numpy.linalg import norm

# Initialize Flask app
app = Flask(__name__)

# Ensure 'static/uploads' directory exists
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load styles.csv (id → articleType mapping)
styles_df = pd.read_csv('styles.csv', usecols=['id', 'articleType'])
id_to_articleType = dict(zip(styles_df['id'].astype(str), styles_df['articleType']))

# Load precomputed features & filenames
feature_list = np.array(pickle.load(open('embedding.pkl', 'rb')))
filenames = pickle.load(open('filenames.pkl', 'rb'))

# Load ResNet50 Model
model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
model.trainable = False
model = tf.keras.Sequential([
    model,
    GlobalMaxPooling2D()
])

# Feature Extraction
def feature_extraction(img_path, model):
    try:
        img = Image.open(img_path).convert('RGB')
        img = img.resize((224, 224))
        img_array = image.img_to_array(img)
        expanded_img_array = np.expand_dims(img_array, axis=0)
        preprocessed_img = preprocess_input(expanded_img_array)
        result = model.predict(preprocessed_img).flatten()
        normalized_result = result / norm(result)
        return normalized_result
    except Exception as e:
        return None

# Build FAISS Index
feature_list = feature_list.astype('float32')
index = faiss.IndexFlatL2(feature_list.shape[1])
index.add(feature_list)

# Recommendation using FAISS
def recommend_faiss(features, index, k=5):
    features = np.expand_dims(features.astype('float32'), axis=0)
    distances, indices = index.search(features, k)
    return indices[0]

# Home Page
@app.route('/')
def home():
    return render_template('index.html')

# API to handle multiple image uploads
@app.route('/predict', methods=['POST'])
def predict():
    if 'files' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    files = request.files.getlist('files')
    response_data = []

    for uploaded_file in files:
        file_path = os.path.join(UPLOAD_FOLDER, uploaded_file.filename)
        uploaded_file.save(file_path)

        # Extract features
        features = feature_extraction(file_path, model)
        
        if features is not None:
            # Get recommended images
            indices = recommend_faiss(features, index, k=5)

            # Determine assigned article type
            assigned_article_type = "Unknown"
            for idx in indices:
                img_filename = os.path.basename(filenames[idx])
                img_id = os.path.splitext(img_filename)[0]

                if img_id in id_to_articleType:
                    assigned_article_type = id_to_articleType[img_id]
                    break  # Assign first valid articleType

            # Get recommended images and their article types
            recommended_items = []
            for i in indices:
                img_filename = os.path.basename(filenames[i])
                img_id = os.path.splitext(img_filename)[0]
                article_type = id_to_articleType.get(img_id, "Unknown")

                recommended_items.append({
                    "image": filenames[i],
                    "article_type": article_type
                })

            response_data.append({
                "uploaded_image": file_path,
                "predicted_article_type": assigned_article_type,
                "recommendations": recommended_items
            })

        else:
            return jsonify({"error": f"Feature extraction failed for {uploaded_file.filename}"}), 500

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)