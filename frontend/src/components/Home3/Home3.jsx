import React from "react";
import "./Home3.css";

const Home3 = () => {
  return (
    <div className="main">
      {/* Quote Section */}
      <div className="quotemain">
        <div>GET YOURSELF</div>
        <div>INTO THE RIGHT GEAR</div>
      </div>

      {/* Features Section */} 
      <div className="features">
        <div className="feature-item"> AI Outfit Suggestions</div>
        <div className="feature-item"> AI Fashion Chatbot</div>
        <div className="feature-item"> Discover New Trends</div>
        <div className="feature-item"> Personalized Shopping</div>
        <div className="feature-item"> Compare Prices Across Platforms</div>
        {/* <div className="feature-item"> Celebrity Fashion Trends</div> */}
      </div>
    </div>
  );
};

export default Home3;
