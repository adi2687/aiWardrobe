import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTshirt, FaRobot, FaCamera, FaShoppingBag, FaHeart, FaArrowRight } from 'react-icons/fa';
import './Intro.css';

const Intro = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to Outfit AI",
      description: "Your personal AI-powered wardrobe assistant",
      icon: <FaRobot className="step-icon" />,
      color: "#6a11cb"
    },
    {
      title: "Organize Your Wardrobe",
      description: "Upload and categorize your clothing items to create your digital wardrobe",
      icon: <FaTshirt className="step-icon" />,
      color: "#2575fc"
    },
    {
      title: "Get AI Recommendations",
      description: "Receive personalized outfit recommendations based on your style, weather, and occasions",
      icon: <FaRobot className="step-icon" />,
      color: "#fd79a8"
    },
    {
      title: "Virtual Try-On",
      description: "See how clothes look on you before buying with our virtual try-on feature",
      icon: <FaCamera className="step-icon" />,
      color: "#6c5ce7"
    },
    {
      title: "Shop Smart",
      description: "Buy and sell clothes in our marketplace with AI-powered suggestions",
      icon: <FaShoppingBag className="step-icon" />,
      color: "#00b894"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark intro as complete
      localStorage.setItem('introComplete', 'true');
      if (onComplete) {
        onComplete();
      } else {
        navigate('/profile');
      }
    }
  };

  const handleSkip = () => {
    // Mark intro as complete
    localStorage.setItem('introComplete', 'true');
    if (onComplete) {
      onComplete();
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="intro-container">
      <div className="intro-content">
        <div className="progress-bar">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`progress-dot ${index <= currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>
        
        <div className="step-content" style={{ '--accent-color': steps[currentStep].color }}>
          <div className="step-icon-container">
            {steps[currentStep].icon}
          </div>
          <h1>{steps[currentStep].title}</h1>
          <p>{steps[currentStep].description}</p>
        </div>
        
        <div className="intro-buttons">
          <button className="skip-button" onClick={handleSkip}>
            Skip
          </button>
          <button className="next-button" onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'} 
            <FaArrowRight className="button-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Intro;
