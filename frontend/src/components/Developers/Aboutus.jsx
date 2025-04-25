import React from "react";
import "./AboutUs.css";
import { FaLinkedin, FaGithub, FaEnvelope, FaCode, FaBrain } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="aboutus-container">
      <header className="aboutus-header">
        <h1>About OUTFIT_AI</h1>
        <p>
          Revolutionizing fashion with AI technology to create personalized wardrobe experiences
        </p>
      </header>

      <div className="aboutus-quote">
        "Fashion is about dressing according to what's fashionable. Style is more about being yourself."
        <span className="quote-author">— Oscar de la Renta</span>
      </div>

      <section className="aboutus-section">
        <h2>Our Mission</h2>
        <p>
          At OUTFIT_AI, our mission is to provide users with an innovative platform for
          personalized fashion recommendations, wardrobe management, and a
          seamless online shopping experience. We leverage cutting-edge Artificial
          Intelligence and Augmented Reality to make your wardrobe smarter and
          more efficient.
        </p>
        <p>
          We believe that technology can transform the way people interact with their clothes,
          making fashion more accessible, sustainable, and personalized than ever before.
          By combining AI-powered recommendations with intuitive design, we aim to eliminate
          the daily struggle of deciding what to wear.
        </p>
      </section>

      <section className="aboutus-section">
        <h2>Our Vision</h2>
        <p>
          We envision a future where fashion is tailored to every individual's
          style, preferences, and lifestyle. With our AI-driven wardrobe assistant, we aim to
          simplify the way people shop, organize, and interact with their
          clothes.
        </p>
        <p>
          Our goal is to create a world where:
        </p>
        <ul className="vision-list">
          <li>Everyone has access to personalized style advice</li>
          <li>Wardrobe management becomes effortless and intuitive</li>
          <li>Fashion choices are informed by real-time data like weather and occasions</li>
          <li>Shopping becomes more targeted and sustainable</li>
          <li>Technology enhances personal expression through clothing</li>
        </ul>
      </section>

      <section className="aboutus-section">
        <h2>Our Team</h2>
        <ul className="team-list">
          <li>
            <strong>Aditya Kurani</strong>
            <div className="team-role">Full Stack Developer & UX Designer</div>
            <p>
              Leads frontend development and backend integration, specializing in fashion recommendation algorithms and user experience design. Passionate about creating intuitive interfaces that make technology accessible to everyone.
            </p>
            <div className="team-social">
              <a href="mailto:adityakurani26@gmail.com" className="social-link">
                <FaEnvelope /> adityakurani26@gmail.com
              </a>
              <a href="https://github.com/adi2687" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaGithub /> GitHub
              </a>
              <a href="https://linkedin.com/in/aditya-kurani" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaLinkedin /> LinkedIn
              </a>
            </div>
          </li>

          <li>
            <strong>Paras Rana</strong>
            <div className="team-role">AI/ML Engineer</div>
            <p>
              Leads the AI/ML development for cloth identification and shopping recommendations. Expert in computer vision and natural language processing with a passion for applying cutting-edge AI to solve real-world problems.
            </p>
            <div className="team-social">
              <a href="mailto:parasrana579@gmail.com" className="social-link">
                <FaEnvelope /> parasrana579@gmail.com
              </a>
              <a href="https://github.com/parasrana" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaGithub /> GitHub
              </a>
              <a href="https://linkedin.com/in/paras-rana" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaLinkedin /> LinkedIn
              </a>
            </div>
          </li>
        </ul>
      </section>

      <section className="aboutus-section">
        <h2>Our Approach</h2>
        <div className="approach-grid">
          <div className="approach-item">
            <div className="approach-icon">
              <FaBrain />
            </div>
            <h3>AI-Powered Intelligence</h3>
            <p>
              We use advanced machine learning algorithms to understand your style preferences, analyze your wardrobe, and provide personalized recommendations that improve over time.
            </p>
          </div>
          <div className="approach-item">
            <div className="approach-icon">
              <FaCode />
            </div>
            <h3>Thoughtful Design</h3>
            <p>
              Every feature in OUTFIT_AI is designed with the user in mind, creating an intuitive experience that makes fashion technology accessible to everyone.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
