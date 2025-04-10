import React from "react";
import "./DiscoverTrends.css";
import { Sparkles } from "lucide-react";

const DiscoverTrends = () => {
  return (
    <div className="discover-trends">
      <div className="header">
        <Sparkles size={28} className="trend-icon" />
        <h2>Discover New Trends</h2>
      </div>
      <p>Stay ahead in fashion. Explore the latest styles curated just for you.</p>
      <button className="explore-btn">Explore Now</button>
    </div>
  );
};

export default DiscoverTrends;
