import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home5.css";

const Home5 = () => {
  const navigate = useNavigate();

  const handleTryNow = () => navigate("/recommendations");

  const featureRoutes = {
    "Weather based recommendations": "/recommendations",
    "Daily outfit planner": "/planner",
    "Sell your old clothes": "/sellcloth",
    "Accessories guider": "/accessories",
    "Location-Based Outfit Suggestions": "/recommendations",
  };

  const handleFeatureClick = (feature) => {
    const path = featureRoutes[feature];
    if (path) navigate(path);
  };

  const features = Object.keys(featureRoutes);

  return (
    <div className="home5-container">
      <div className="quotehome5">
        Ditch the <div className="red">Guesswork</div>—Let <div className="green">AI </div>Define Your Look.
      </div>

      <div className="cta-button">
        <button onClick={handleTryNow}>Try Now</button>
      </div>

      <div className="features_page5">
        {features.map((feature, index) => (
          <div key={index} onClick={() => handleFeatureClick(feature)}>
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home5;
