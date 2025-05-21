import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTshirt, FaRobot, FaCamera, FaShoppingBag, FaClipboardCheck } from 'react-icons/fa';
import './Intro.css';

const Intro = ({ onComplete }) => {
  const [showFloatingMessage, setShowFloatingMessage] = useState(false);
  const [floatingMessageIndex, setFloatingMessageIndex] = useState(0);
  const [floatingMessagePosition, setFloatingMessagePosition] = useState({ top: '50%', left: '50%' });
  const navigate = useNavigate();

  const floatingMessages = [
    { text: "Digitize Your Wardrobe" },
    { text: "Discover Perfect Outfits" },
    { text: "Experience Virtual Try-On" },
  ];

  

  // Handle floating messages animation
  useEffect(() => {
    // Start showing floating messages when component mounts
    const showMessage = () => {
      setShowFloatingMessage(true);
      
      // Hide message after 3 seconds (matching the CSS animation duration)
      setTimeout(() => {
        setShowFloatingMessage(false);
        
        // Move to next message after hiding
        setTimeout(() => {
          // Move to next message index
          const nextIndex = (floatingMessageIndex + 1) % floatingMessages.length;
          setFloatingMessageIndex(nextIndex);
          
          // If we've gone through all messages once, complete the intro
          if (nextIndex === 0) {
            // After showing all messages once, complete the intro
            setTimeout(() => {
              handleComplete();
            }, 500);
          } else {
            showMessage();
          }
        }, 500);
      }, 3000);
    };
    
    showMessage();
    
    return () => {
      // Clean up any timeouts when component unmounts
      setShowFloatingMessage(false);
    };
  }, [floatingMessageIndex]);

  const handleComplete = () => {
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
      {/* Floating animated messages */}
      {showFloatingMessage && (
        <div className="floating-message">
          <div className="floating-message-text">
            {floatingMessages[floatingMessageIndex].text}
          </div>
        </div>
      )}
      
      
    </div>
  );
};

export default Intro;
