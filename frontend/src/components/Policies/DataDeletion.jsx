import React from 'react';
import './Policies.css';
import { Link } from 'react-router-dom';

const DataDeletion = () => {
  return (
    <div className="policy-container">
      <div className="policy-content">
        <h1>Data Deletion Instructions</h1>
        <p className="last-updated">Last Updated: April 27, 2025</p>
        
        <section>
          <h2>How to Request Deletion of Your Data</h2>
          <p>
            At OUTFIT_AI, we respect your privacy and your right to control your personal data. This page explains how you can request the deletion of your personal information from our systems.
          </p>
        </section>
        
        <section>
          <h2>Data Deletion Process</h2>
          <p>You can request deletion of your personal data through any of the following methods:</p>
          
          <h3>Option 1: Email Request</h3>
          <p>
            Send an email to <a href="mailto:adityakurani26@gmail.com">adityakurani26@gmail.com</a> with the subject line "Data Deletion Request" and include the following information:
          </p>
          <ul>
            <li>Your full name</li>
            <li>Email address associated with your OUTFIT_AI account</li>
            <li>Brief statement requesting deletion of your data</li>
          </ul>
          
          <h3>Option 2: In-App Deletion</h3>
          <p>
            You can also delete your account and associated data directly from within the OUTFIT_AI application:
          </p>
          <ol>
            <li>Log in to your OUTFIT_AI account</li>
            <li>Navigate to Profile → Settings</li>
            <li>Scroll down to the "Account" section</li>
            <li>Click on "Delete Account"</li>
            <li>Follow the confirmation steps to complete the deletion process</li>
          </ol>
        </section>
        
        <section>
          <h2>What Happens After Your Request</h2>
          <p>Once we receive your deletion request, we will:</p>
          <ol>
            <li>Verify your identity to ensure the security of your data</li>
            <li>Process your request within 30 days</li>
            <li>Delete your personal information from our active databases</li>
            <li>Ensure your data is also removed from our backup systems within 90 days</li>
            <li>Send you a confirmation email once the deletion process is complete</li>
          </ol>
        </section>
        
        <section>
          <h2>Data We Delete</h2>
          <p>When you request data deletion, we will remove:</p>
          <ul>
            <li>Your account information (name, email, profile picture)</li>
            <li>Images of clothing items you've uploaded</li>
            <li>Your wardrobe inventory</li>
            <li>Outfit combinations you've created</li>
            <li>Your preferences and settings</li>
            <li>Usage history and analytics data associated with your account</li>
          </ul>
        </section>
        
        <section>
          <h2>Data We May Retain</h2>
          <p>
            We may retain certain information even after you request deletion in the following circumstances:
          </p>
          <ul>
            <li>When required by applicable law or regulations</li>
            <li>For fraud prevention purposes</li>
            <li>To resolve disputes or enforce our agreements</li>
            <li>Anonymized or aggregated data that cannot be used to identify you</li>
          </ul>
          <p>
            Any information we retain will be handled in accordance with our Privacy Policy.
          </p>
        </section>
        
        <section>
          <h2>Third-Party Data</h2>
          <p>
            Please note that if you've used third-party authentication services (like Google or Facebook) to create your OUTFIT_AI account, we will delete the data stored in our systems, but you may need to contact these third parties separately to request deletion of data they hold about you.
          </p>
        </section>
        
        <section>
          <h2>Contact Us</h2>
          <p>
            If you have any questions about the data deletion process or need assistance, please contact us at:
          </p>
          <p>
            Email: <a href="mailto:adityakurani26@gmail.com">adityakurani26@gmail.com</a><br />
            Address: Marble City Hospital, Kishangarh, Rajasthan, 305801, India
          </p>
        </section>
        
        <div className="policy-navigation">
          <Link to="/privacy-policy" className="policy-link">Privacy Policy</Link>
          <Link to="/terms-of-service" className="policy-link">Terms of Service</Link>
          <Link to="/" className="policy-link">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default DataDeletion;
