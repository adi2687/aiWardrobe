import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="aboutus-container">
      <header className="aboutus-header">
        <h1>About Us</h1>
        <p>
          We are the team behind **Outfit AI** - revolutionizing fashion with AI
          technology.
        </p>
      </header>

      <section className="aboutus-section">
        <h2>Our Mission</h2>
        <p>
          Our mission is to provide users with an innovative platform for
          personalized fashion recommendations, wardrobe management, and a
          seamless online shopping experience. We leverage Artificial
          Intelligence and Augmented Reality to make your wardrobe smarter and
          more efficient.
        </p>
      </section>

      <section className="aboutus-section">
        <h2>Our Vision</h2>
        <p>
          We envision a future where fashion is tailored to every individual’s
          style and needs. With our AI-driven wardrobe assistant, we aim to
          simplify the way people shop, organize, and interact with their
          clothes. We believe that technology can transform the fashion industry
          by creating personalized and sustainable wardrobe solutions.
        </p>
      </section>

      <section className="aboutus-section">
        <h2>Our Team</h2>
        <ul>
          <li>
            <strong>
              Aditya Kurani{" "}
              <a href="mailto:adityakurani26@gmail.com" className="email">
                (adityakurani26@gmail.com)
              </a>
              :
            </strong>{" "}
            Frontend development (UI/UX) and Backend integration (API setup,
            database management, Fashion Recommendations).
          </li>

          <li>
            <strong>
              Paras Rana{" "}
              <a href="mailto:parasrana579@gmail.com" className="email">
                (parasrana579@gmail.com)
              </a>
              :
              
            </strong>{" "}
            AI model development for Cloth identification and shopping.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default AboutUs;
