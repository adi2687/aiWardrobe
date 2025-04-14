import React from 'react';
import Img from '/project2_image.jpg';
import './Homemain.css';

const Homemain = () => {
  return (
    <div className="Main">
      <img src={Img} alt="Background" />
      <div className="content">
        <div className="quote">
          <div>Why guess</div>
          <div>what to wear?</div>
          <div>Let AI style you with precision and confidence.</div>
        </div>
        <div className="secondquote">
          <div>Smart styling,</div>
          <div className="highlight">powered by AI</div>
          <div>— because every outfit should feel like your best one.</div>
        </div>
      </div>
    </div>
  );
}

export default Homemain;
