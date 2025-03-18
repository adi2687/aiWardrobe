import React, { useEffect, useRef } from "react";
import "./Home5.css";

const Home5 = () => {
  const sectionRef = useRef(null);

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

  return (
    <div className="home5-container" ref={sectionRef}>
      <div className="quote">Ditch the Guesswork—Let AI Define Your Look.</div>
      <div className="cta-button">
        <button>Try Now</button>
      </div>
    </div>
  );
};

export default Home5;
