import React from "react";
import "./Recommendations.css";

const Recommendations = () => {
  return (
    <div className="recommendations-container">
      <div className="recommendations-card">
        <h2>AI Outfit Recommender</h2>
        <form>
          <input
            type="text"
            placeholder="Describe the event (e.g., Wedding, Casual Meetup)"
          />
          <button type="submit" className="recommendations-btn">
            Get Outfit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Recommendations;
