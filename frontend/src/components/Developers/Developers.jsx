import React from 'react';
import './DeveloperPage.css';

const DeveloperPage = () => {
  return (
    <div className="developer-page-container">
      <header className="header">
        <h1>Outfit AI  - Developer's Page</h1>
        <p>An innovative platform to help users with personalized fashion recommendations and virtual wardrobe organization.</p>
      </header>

      <section className="section">
        <h2>Project Overview</h2>
        <p>
          The Wardrobe AI Assistant leverages Artificial Intelligence and Augmented Reality to provide personalized fashion
          recommendations, virtual wardrobe organization, and integrated e-commerce shopping experiences.
        </p>
      </section>

      <section className="section">
        <h2>Meet the Team</h2>
        <ul>
          <li><strong>Aditya kurani</strong> - Web Developer (Fashion Recommedation)</li>
          <li><strong>Paras Rana</strong> - AI/ML Developer (Shopping and Cloth identification)</li>
        </ul>
      </section>

      <section className="section">
        <h2>Tech Stack</h2>
        <ul>
          <li><strong>Frontend:</strong> React.js, TailwindCSS</li>
          <li><strong>Backend:</strong> Express.js, Node.js</li>
          <li><strong>Database:</strong> MongoDB</li>
          <li><strong>AI/ML:</strong> Python - Cloth identification model and Google Gemini</li>
          <li><strong>Weather API:</strong> OpenWeatherMap API</li>
          <li><strong>E-commerce Integration:</strong> Shopify, Amazon, Myntra Data scraping</li>
          <li><strong>Authentication:</strong> OAuth 2.0 (Google ,Apple and Facebook)</li>
        </ul>
      </section>

      <section className="section">
        <h2>Features</h2>
        <ul>
          <li><strong>AI-Powered Fashion Recommendations:</strong> Personalized outfit suggestions based on weather, events, and user preferences.</li>
          <li><strong>Virtual Wardrobe Organization:</strong> Users can upload their wardrobe and organize it for efficient planning.</li>
          <li><strong>Outfit Mix & Match:</strong> Generate various outfit combinations based on user preferences and available items.</li>
          <li><strong>E-Commerce Integration:</strong> Seamless shopping experience by integrating with platforms like Shopify, Amazon, Myntra and Flipkart.</li>
        </ul>
      </section>

      <section className="section">
        <h2>Developer Responsibilities</h2>
        <ul>
          <li><strong>Aditya Kurani:</strong> Frontend development (UI/UX) and Backend integration (API setup, database management, Fashion Recommedations).</li>
          <li><strong>Paras Rana:</strong> AI model development for Cloth identification and shopping . </li>
        </ul>
      </section>

      
    </div>
  );
};

export default DeveloperPage;
