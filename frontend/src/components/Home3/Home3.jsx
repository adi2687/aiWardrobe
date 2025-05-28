  import React from "react";
  import "./Home3.css";
  import { Link } from "react-router-dom";

  const Home3 = () => {
    return (
      <div className="main">
        <div className="quotemain">
          <div>GET YOURSELF</div>
          <div>INTO THE RIGHT GEAR</div>
        </div>

        <div className="features" >
          <div className="feature-item">
            <Link to="/recommendations" style={{textDecoration:"none",color:"white"}}>AI Outfit Suggestions</Link>
          </div>
          <div className="feature-item">
            <Link to="/chatbot" style={{textDecoration:"none",color:"white"}}>AI Fashion Chatbot</Link>
          </div>
          <div className="feature-item">
            <Link to="/shop" style={{textDecoration:"none",color:"white"}}>Personalized Shopping</Link>
          </div>
          <div className="feature-item">
            <Link to="/recommendations" style={{textDecoration:"none",color:"white"}}>Weather and Location-Based Recommendations</Link>
          </div>
          <div className="feature-item">
            <Link to="/planner" style={{textDecoration:"none",color:"white"}}>Daily Outfit Planner</Link>
          </div>
          <div className="feature-item">
            <Link to="/sellcloth" style={{textDecoration:"none",color:"white"}}>Sell Your Old Clothes</Link>
          </div>
        </div>
      </div>
    );
  };

  export default Home3;
