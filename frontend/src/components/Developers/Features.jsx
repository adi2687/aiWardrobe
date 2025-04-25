import React from 'react';
import './Features.css';
import { FaCloud, FaTshirt, FaRandom, FaShoppingCart, FaUserAlt, FaCode, FaMobileAlt, FaCalendarAlt, FaShareAlt, FaRobot } from 'react-icons/fa';

const Features = () => {
  return (
    <div className="features-container">
      <div className="features-header">
        <h1>OUTFIT_AI Features</h1>
        <p>Discover the innovative capabilities that make OUTFIT_AI your perfect wardrobe assistant</p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <FaCloud />
          </div>
          <div className="feature-content">
            <h3>Weather-Based Recommendations</h3>
            <p>Get outfit suggestions perfectly suited to current and forecasted weather conditions in your location.</p>
            <ul className="feature-details">
              <li>Real-time weather data integration</li>
              <li>7-day forecast outfit planning</li>
              <li>Seasonal wardrobe transitions</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaTshirt />
          </div>
          <div className="feature-content">
            <h3>Virtual Wardrobe Management</h3>
            <p>Upload and organize your entire clothing collection for effortless outfit planning and selection.</p>
            <ul className="feature-details">
              <li>Easy clothing categorization</li>
              <li>Image-based wardrobe inventory</li>
              <li>Smart organization system</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaRandom />
          </div>
          <div className="feature-content">
            <h3>Outfit Mix & Match</h3>
            <p>Discover countless stylish combinations from your existing wardrobe with AI-powered suggestions.</p>
            <ul className="feature-details">
              <li>AI-driven style coordination</li>
              <li>Color and pattern matching</li>
              <li>Occasion-specific recommendations</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaShoppingCart />
          </div>
          <div className="feature-content">
            <h3>Smart Shopping Integration</h3>
            <p>Shop for new clothing items that perfectly complement your existing wardrobe from top retailers.</p>
            <ul className="feature-details">
              <li>Amazon, Myntra, and Flipkart integration</li>
              <li>Price comparison across platforms</li>
              <li>Wishlist and favorites management</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaMobileAlt />
          </div>
          <div className="feature-content">
            <h3>3D Mannequin Preview</h3>
            <p>Visualize complete outfits on a virtual mannequin before deciding what to wear.</p>
            <ul className="feature-details">
              <li>Realistic 3D visualization</li>
              <li>Rotate and view from all angles</li>
              <li>Try before you wear confidence</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaUserAlt />
          </div>
          <div className="feature-content">
            <h3>Personalized Style Learning</h3>
            <p>The AI learns your preferences over time, delivering increasingly accurate recommendations.</p>
            <ul className="feature-details">
              <li>Style preference analysis</li>
              <li>Adaptive recommendations</li>
              <li>Personal style evolution</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaCalendarAlt />
          </div>
          <div className="feature-content">
            <h3>Weekly Outfit Planner</h3>
            <p>Plan your outfits for the entire week in advance, saving time and reducing daily decision fatigue.</p>
            <ul className="feature-details">
              <li>Calendar integration</li>
              <li>Event-specific outfit planning</li>
              <li>Automatic weather adaptation</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaShareAlt />
          </div>
          <div className="feature-content">
            <h3>Social Sharing</h3>
            <p>Share your favorite outfits with friends and get feedback on your style choices.</p>
            <ul className="feature-details">
              <li>One-click outfit sharing</li>
              <li>Friend feedback system</li>
              <li>Style community integration</li>
            </ul>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FaRobot />
          </div>
          <div className="feature-content">
            <h3>AI Fashion Assistant</h3>
            <p>Chat with our intelligent assistant for style advice, fashion tips, and trend information.</p>
            <ul className="feature-details">
              <li>24/7 fashion advice</li>
              <li>Trend analysis and recommendations</li>
              <li>Personal styling questions answered</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="features-cta">
        <h2>Ready to transform your wardrobe experience?</h2>
        <p>Join thousands of users who have revolutionized their daily outfit selection with OUTFIT_AI</p>
        <div className="cta-buttons">
          <a href="/download" className="cta-button primary">Download Now</a>
          <a href="/auth" className="cta-button secondary">Create Account</a>
        </div>
      </div>
    </div>
  );
};

export default Features;
