import React from 'react';
import './DeveloperPage.css';
import { FaGithub, FaLinkedin, FaCode, FaDatabase, FaServer, FaReact, FaNodeJs, FaAws } from 'react-icons/fa';

const DeveloperPage = () => {
  return (
    <div className="developer-page-container">
      <header className="dev-header">
        <h1>OUTFIT_AI Development Team</h1>
        <p>Building the future of fashion technology with AI and AR</p>
      </header>

      <section className="dev-section vision-section">
        <h2>Our Vision</h2>
        <p>
          OUTFIT_AI is revolutionizing the way people interact with their wardrobes. We combine cutting-edge AI technology 
          with intuitive design to create a seamless fashion experience that helps users look their best every day.
        </p>
        <div className="tech-icons">
          <FaReact className="tech-icon" title="React" />
          <FaNodeJs className="tech-icon" title="Node.js" />
          <FaDatabase className="tech-icon" title="MongoDB" />
          <FaServer className="tech-icon" title="Express" />
          <FaAws className="tech-icon" title="Cloud Services" />
        </div>
      </section>

      <section className="dev-section team-section">
        <h2>Meet the Developers</h2>
        <div className="team-cards">
          <div className="dev-card">
            <div className="dev-avatar">
              <img src="/dev-aditya.jpg" alt="Aditya Kurani" onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=AK'}} />
            </div>
            <h3>Aditya Kurani</h3>
            <p className="dev-role">Full Stack Developer</p>
            <p className="dev-description">
              Lead developer for the frontend and backend integration. Specializes in fashion recommendation algorithms and user experience design.
            </p>
            <div className="dev-social">
              <a href="https://github.com/adi2687" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
              <a href="https://linkedin.com/in/aditya-kurani" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            </div>
          </div>

          <div className="dev-card">
            <div className="dev-avatar">
              <img src="/dev-paras.jpg" alt="Paras Rana" onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=PR'}} />
            </div>
            <h3>Paras Rana</h3>
            <p className="dev-role">AI/ML Engineer</p>
            <p className="dev-description">
              Leads the AI/ML development for cloth identification and shopping recommendations. Expert in computer vision and natural language processing.
            </p>
            <div className="dev-social">
              <a href="https://github.com/parasrana" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
              <a href="https://linkedin.com/in/paras-rana" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="dev-section tech-section">
        <h2>Technology Stack</h2>
        <div className="tech-stack">
          <div className="tech-category">
            <h3>Frontend</h3>
            <ul>
              <li>React.js</li>
              <li>TailwindCSS</li>
              <li>Three.js (3D Visualization)</li>
              <li>Socket.io (Real-time)</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Backend</h3>
            <ul>
              <li>Node.js</li>
              <li>Express.js</li>
              <li>MongoDB</li>
              <li>JWT Authentication</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>AI/ML</h3>
            <ul>
              <li>Google Gemini API</li>
              <li>OpenAI API</li>
              <li>Computer Vision (Cloth ID)</li>
              <li>Weather API Integration</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>DevOps</h3>
            <ul>
              <li>Vercel Deployment</li>
              <li>CI/CD Pipeline</li>
              <li>Cloudinary (Image Storage)</li>
              <li>Git Version Control</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="dev-section features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌦️</div>
            <h3>Weather-Based Recommendations</h3>
            <p>Get outfit suggestions based on current and forecasted weather conditions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👕</div>
            <p>Virtual Wardrobe Management</p>
            <p>Upload and organize your clothing items for easy outfit planning.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Fashion Assistant</h3>
            <p>Chat with our AI assistant for style advice and fashion tips.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧍‍♂️</div>
            <h3>Mannequin Preview</h3>
            <p>Visualize outfits on a 3D mannequin before trying them on.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛍️</div>
            <h3>Smart Shopping</h3>
            <p>Get personalized shopping recommendations from Amazon, Myntra, and Flipkart.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Outfit Sharing</h3>
            <p>Share your outfits with friends and get feedback.</p>
          </div>
        </div>
      </section>

      <section className="dev-section roadmap-section">
        <h2>Development Roadmap</h2>
        <div className="roadmap">
          <div className="roadmap-item completed">
            <div className="roadmap-marker"></div>
            <div className="roadmap-content">
              <h3>Phase 1: Core Platform</h3>
              <p>Wardrobe management, basic recommendations, user authentication</p>
              <span className="roadmap-date">Completed</span>
            </div>
          </div>
          <div className="roadmap-item completed">
            <div className="roadmap-marker"></div>
            <div className="roadmap-content">
              <h3>Phase 2: AI Integration</h3>
              <p>AI fashion assistant, advanced recommendations, weather integration</p>
              <span className="roadmap-date">Completed</span>
            </div>
          </div>
          <div className="roadmap-item active">
            <div className="roadmap-marker"></div>
            <div className="roadmap-content">
              <h3>Phase 3: AR Features</h3>
              <p>3D mannequin preview, virtual try-on, enhanced visualization</p>
              <span className="roadmap-date">In Progress</span>
            </div>
          </div>
          <div className="roadmap-item">
            <div className="roadmap-marker"></div>
            <div className="roadmap-content">
              <h3>Phase 4: Social & Community</h3>
              <p>Social sharing, community features, style inspiration</p>
              <span className="roadmap-date">Upcoming</span>
            </div>
          </div>
          <div className="roadmap-item">
            <div className="roadmap-marker"></div>
            <div className="roadmap-content">
              <h3>Phase 5: Advanced E-commerce</h3>
              <p>Enhanced shopping integration, price tracking, personalized deals</p>
              <span className="roadmap-date">Future</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dev-section contact-section">
        <h2>Get Involved</h2>
        <p>Interested in contributing to OUTFIT_AI or have suggestions for improvements?</p>
        <div className="contact-buttons">
          <a href="mailto:dev@outfitai.com" className="contact-button email">Contact the Team</a>
          <a href="https://github.com/adi2687/aiWardrobe" target="_blank" rel="noopener noreferrer" className="contact-button github">
            <FaGithub /> View on GitHub
          </a>
        </div>
      </section>
    </div>
  );
};

export default DeveloperPage;
