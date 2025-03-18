import React, { useEffect, useRef } from "react";
import "./Home5.css";

const Home5 = () => {

  return (
    <div className="home5-container" >
      <div className="quotehome5">Ditch the <div className="red">Guesswork</div>—Let <div className="green">AI </div>Define Your Look.</div>
      <div className="cta-button">
        <button>Try Now</button>
      </div>
      <div className="features_page5">
        <div>Weather based recommendations</div>
        <div>Daily outfit planner</div>
        <div>Sell your old clothes </div>
        <div>Accessories guider</div>
        {/* <br /> */}
        <div>Augmented Reality (AR)</div>
        <div>AI-Generated Fashion Reels</div>
        {/* <div> Fashion Community & Social Feed</div> */}
        <div>Location-Based Outfit Suggestions</div>
        {/* <div>AR Prev</div> */}
      </div>
    </div>
  );
};

export default Home5;
