import React from "react";
import ReadyPlayerMeAvatar from "./AR_try";
import "./AR.css";

function ARMain() {
  return (
    <div className="ar-container">
      <div className="ar-header">
        <h1 className="ar-title">Virtual Try-On</h1>
        <p className="ar-subtitle">Create your 3D avatar and try on clothes virtually</p>
      </div>
      
      <div className="ar-content">
        <ReadyPlayerMeAvatar />
      </div>
    </div>
  );
}

export default ARMain;
