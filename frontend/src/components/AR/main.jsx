// src/App.js
import React from 'react';
import ReadyPlayerMeAvatar from './AR_try';
import './AR.css';

const ARComponent = () => {
  return (
    <div className="ar-container">
      <div className="ar-header">
        <h1 className="ar-title">Virtual Try-On</h1>
        <p className="ar-subtitle">
          Create your 3D avatar to try on clothing items virtually. This feature allows you to see how different outfits would look on you before making a purchase.
        </p>
      </div>
      
      <div className="ar-content">
        <ReadyPlayerMeAvatar />
      </div>
    </div>
  );
};

export default ARComponent;
