import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Intro.css';

const Intro = ({ onComplete }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [nextMessage, setNextMessage] = useState(null);
  const [fadeState, setFadeState] = useState('in'); // 'in', 'out', or 'between'
  const navigate = useNavigate();

  const floatingMessages = [
    { text: "Digitize Your Wardrobe" },
    { text: "Discover Perfect Outfits" },
    { text: "Experience Virtual Try-On" },
    { text: "OUTFIT-AI" }
  ];

  

  // Handle message animation with crossfade effect
  useEffect(() => {
    let fadeTimer, nextMessageTimer, completeTimer;
    
    // Initial fade in
    if (fadeState === 'in') {
      // Show current message for 2 seconds before starting to fade out
      fadeTimer = setTimeout(() => {
        setFadeState('out');
      }, 2000);
    }
    
    // Handle fade out and prepare next message
    if (fadeState === 'out') {
      fadeTimer = setTimeout(() => {
        // Calculate next message index
        const next = (currentMessage + 1) % floatingMessages.length;
        
        // If we've gone through all messages, complete the intro
        if (next === 0 && currentMessage === floatingMessages.length - 1) {
          setFadeState('between');
          completeTimer = setTimeout(handleComplete, 400);
        } else {
          // Otherwise prepare for next message
          setNextMessage(next);
          setFadeState('between');
        }
      }, 500); // Time to fade out
    }
    
    // Handle between state - when one message is gone and next is coming
    if (fadeState === 'between') {
      nextMessageTimer = setTimeout(() => {
        if (nextMessage !== null) {
          setCurrentMessage(nextMessage);
          setNextMessage(null);
          setFadeState('in');
        }
      }, 300); // Short pause between messages
    }
    
    // Clean up all timeouts when component unmounts or when state changes
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(nextMessageTimer);
      clearTimeout(completeTimer);
    };
  }, [currentMessage, fadeState, nextMessage, floatingMessages.length]);

  const handleComplete = () => {
    // Mark intro as complete
    localStorage.setItem('introComplete', 'true');
    if (onComplete) {
      onComplete();
    } else {
      // navigate('/profile');
    }
  };

  return (
    <div className="intro-container">
      <div className="floating-message">
        <div className={`floating-message-text ${fadeState}`}>
          {floatingMessages[currentMessage].text}
        </div>
      </div>
    </div>
  );
};

export default Intro;