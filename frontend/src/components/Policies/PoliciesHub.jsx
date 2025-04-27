import React from 'react';
import './Policies.css';
import { Link } from 'react-router-dom';

const PoliciesHub = () => {
  return (
    <div className="policy-container">
      <div className="policy-content policies-hub">
        <h1>Legal Documents</h1>
        <p className="hub-description">
          Welcome to the OUTFIT_AI legal documents hub. Here you can find all the policies and legal information related to our service.
        </p>
        
        <div className="policy-cards">
          <div className="policy-card">
            <div className="policy-card-icon">📜</div>
            <h2>Privacy Policy</h2>
            <p>Learn how we collect, use, and protect your personal information.</p>
            <Link to="/privacy-policy" className="policy-card-link">Read Privacy Policy</Link>
          </div>
          
          <div className="policy-card">
            <div className="policy-card-icon">📝</div>
            <h2>Terms of Service</h2>
            <p>Understand the rules and guidelines for using our application.</p>
            <Link to="/terms-of-service" className="policy-card-link">Read Terms of Service</Link>
          </div>
          
          <div className="policy-card">
            <div className="policy-card-icon">🗑️</div>
            <h2>Data Deletion</h2>
            <p>Instructions on how to request deletion of your personal data.</p>
            <Link to="/data-deletion" className="policy-card-link">View Data Deletion Instructions</Link>
          </div>
        </div>
        
        <div className="policies-footer">
          <p>If you have any questions about our policies, please contact us at <a href="mailto:adityakurani26@gmail.com">adityakurani26@gmail.com</a></p>
          <Link to="/" className="back-to-home">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PoliciesHub;
