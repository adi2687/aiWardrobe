import React from "react";
import "./Footer.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

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
        </div>
        <div className="footer-social">
          <a href="https://www.facebook.com/aditya.kurani.1"><FaFacebookF /></a>
          <a href="https://www.instagram.com/aditya_kurani_26/"><FaInstagram /></a>
          <a href="https://x.com/AdityaKurani"><FaTwitter /></a>
          <a href="https://www.linkedin.com/in/aditya-kurani-818668176/"><FaLinkedin /></a>
        </div>
      </div>
      
      <h3>a Production of  <a href="https://www.linkedin.com/in/aditya-kurani-818668176/">Aditya Kurani</a> & <a href="https://linkedin.com/in/paras-rana-696b7731b/">Paras Rana</a></h3>
      <div className="footer-bottom">
         
        © {new Date().getFullYear()} Outfit AI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
