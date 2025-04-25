import React from "react";
import "./Footer.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>Outfit AI</h2>
        </div>
        
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/aboutus">About</a>
          <a href="/features">Features</a>
          <a href="/developers">Developers</a>
          <a href="/download">Download</a>
        </div>
        
        <div className="footer-social">
          <a href="https://www.facebook.com/aditya.kurani.1" aria-label="Facebook"><FaFacebookF /></a>
          <a href="https://www.instagram.com/aditya_kurani_26/" aria-label="Instagram"><FaInstagram /></a>
          <a href="https://x.com/AdityaKurani" aria-label="Twitter"><FaTwitter /></a>
          <a href="https://www.linkedin.com/in/aditya-kurani-818668176/" aria-label="LinkedIn"><FaLinkedin /></a>
          <a href="https://github.com/adi2687" aria-label="GitHub"><FaGithub /></a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p> {new Date().getFullYear()} Outfit AI. All rights reserved. | A Production of <a href="https://www.linkedin.com/in/aditya-kurani-818668176/">Aditya Kurani</a> & <a href="https://linkedin.com/in/paras-rana-696b7731b/">Paras Rana</a></p>
      </div>
    </footer>
  );
};

export default Footer;
