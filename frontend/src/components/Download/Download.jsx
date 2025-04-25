import React, { useState } from 'react';
import './Download.css';
import { FaApple, FaAndroid, FaWindows, FaDownload, FaQrcode, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// Import all app images
import appImage1 from '/AppImages/WhatsApp Image 2025-04-25 at 15.31.57_ade5304b.jpg';
import appImage2 from '/AppImages/WhatsApp Image 2025-04-25 at 15.31.57_ca05be34.jpg';
import appImage4 from '/AppImages/WhatsApp Image 2025-04-25 at 15.31.58_02c3f2fe.jpg';
import appImage5 from '/AppImages/WhatsApp Image 2025-04-25 at 15.31.58_7e947977.jpg';
import appImage6 from '/AppImages/WhatsApp Image 2025-04-25 at 15.31.58_e7a26521.jpg';
import appImage7 from '/AppImages/WhatsApp Image 2025-04-25 at 15.31.58_f7e8a2aa.jpg';
import appImage8 from '/AppImages/WhatsApp Image 2025-04-25 at 15.31.59_e2c86a34.jpg';
import appImage9 from '/AppImages/WhatsApp Image 2025-04-25 at 15.42.42_727e0789.jpg';

const Download = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const appImages = [
    { src: appImage1, alt: "OUTFIT_AI App Preview - Weather Recommendations" },
    { src: appImage2, alt: "OUTFIT_AI App Preview - Wardrobe Management" },
    { src: appImage4, alt: "OUTFIT_AI App Preview - Outfit Sharing" },
    { src: appImage5, alt: "OUTFIT_AI App Preview - Smart Shopping" },
    { src: appImage6, alt: "OUTFIT_AI App Preview - Mannequin Preview" },
    { src: appImage7, alt: "OUTFIT_AI App Preview - Style Suggestions" },
    { src: appImage8, alt: "OUTFIT_AI App Preview - Outfit Planner" },
    { src: appImage9, alt: "OUTFIT_AI App Preview - Chat Assistant" }
  ];
  
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === appImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? appImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="download-container">
      <div className="download-content">
        <h1>Download OUTFIT_AI</h1>
        <p>Get your personal wardrobe assistant on your favorite device</p>
        
        <div className="app-features">
          <div className="feature">
            <span className="feature-icon">🌦️</span>
            <p>Weather-based recommendations</p>
          </div>
          <div className="feature">
            <span className="feature-icon">👕</span>
            <p>Mannequin preview</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <p>AI fashion assistant</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🛍️</span>
            <p>Smart shopping</p>
          </div>
        </div>
        
        <div className="download-buttons">
          <a href="https://expo.dev/accounts/nareshmahiya/projects/Outfitai/builds/164668d2-6251-456e-8436-3c7fc70f229b" className="download-button">
            <FaDownload className="platform-icon" />
            <div className="button-text">
              <span className="small-text">Download</span>
              <span className="large-text">OUTFIT_AI</span>
            </div>
          </a>
        </div>
        
        <div className="app-preview">
          <button className="preview-nav-button prev" onClick={prevImage}>
            <FaArrowLeft />
          </button>
          
          <div className="preview-image-container">
            <img 
              src={appImages[currentImageIndex].src} 
              alt={appImages[currentImageIndex].alt} 
              className="preview-image" 
            />
            <div className="image-indicator">
              {appImages.map((_, index) => (
                <span 
                  key={index} 
                  className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                ></span>
              ))}
            </div>
          </div>
          
          <button className="preview-nav-button next" onClick={nextImage}>
            <FaArrowRight />
          </button>
        </div>
        
        <div className="qr-section">
          <div className="qr-code">
            <img src="/public/qr_code.jpg" alt="qrcode" />
            <p>Scan to download</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;
