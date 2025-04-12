import React from 'react';
import './Features.css';

const Features = () => {
  return (
    <div className="features-container">
      <h2 className="features-title">Outfit AI Assistant - Features</h2>

      <div className="feature-item">
        <h3>AI-Powered Fashion Recommendations</h3>
        <p>Personalized outfit suggestions based on weather, events, and user preferences.</p>
      </div>

      <div className="feature-item">
        <h3>Virtual Wardrobe Organization</h3>
        <p>Users can upload and organize their wardrobe for better planning and selection.</p>
      </div>

      <div className="feature-item">
        <h3>Outfit Mix & Match</h3>
        <p>Generate various outfit combinations based on user preferences and available clothing items.</p>
      </div>

      

      <div className="feature-item">
        <h3>E-Commerce Integration</h3>
        <p>Seamless shopping experience through platforms like Shopify, Amazon, and Flipkart, allowing users to buy items directly.</p>
      </div>

      <div className="feature-item">
        <h3>Weather-Based Outfit Recommendations</h3>
        <p>The app uses weather data (via OpenWeatherMap API) to suggest outfits appropriate for the current weather conditions.</p>
      </div>

      

      <div className="feature-item">
        <h3>User Personalization</h3>
        <p>The AI learns user preferences over time and offers more accurate recommendations based on their style, events, and preferences.</p>
      </div>

      <div className="feature-item">
        <h3>Integration with External APIs</h3>
        <p>Uses e-commerce APIs to allow users to shop for clothing directly from the app. Weather data is used for clothing suggestions.</p>
      </div>
    </div>
  );
};

export default Features;

