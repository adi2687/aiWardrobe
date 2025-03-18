import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home4.css";
import quotesData from "./quotes";

const Home4 = () => {
  const sectionRef = useRef(null);
  const navigate = useNavigate(); // Use useNavigate hook
  const [message, setMessage] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const getRandomQuote = () => {
    const allQuotes = [
      ...quotesData.fashion_quotes,
      ...quotesData.confidence_quotes
    ];
    const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    setMessage(randomQuote);
  };

  return (
    <div className="maindiv" ref={sectionRef}>
      <div className="quote_main">
        <div>AI</div> Meets Aesthetic
        <div className="subtitle">Let AI Style You, So You Can Serve Looks</div>
      </div>
      <div className="cta-button">
        <button onClick={() => navigate("/profile")}>Explore Now</button>
      </div>

      {/* Ask AI for a Tip Section */}
      <div className="ask-ai-container">
        <button onClick={getRandomQuote} className="ask-ai-button">
          Ask AI for a Tip
        </button>
        {message && (
          <div className="ai-tip-box">
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home4;
